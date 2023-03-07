const l2plot = require('./l2plot');

function _generateBtnTemplate(angle) {
    return `<div class="col">
        <div class="l2ElevationBtn" value="${angle}">${angle.toFixed(1)}°</div>
    </div>`;
}
function _generateRow(btnsHTML) {
    return `<div class="row gx-1" style="margin-top: 0.25rem">${btnsHTML}</div>`;
}

const dealiasBtnSelector = ':not(#dealiasBtn)';
const dbs = dealiasBtnSelector; // just for shorthand

function _generateElevationProductLookup(lEAP) {
    // object to lookup a scan number from elevation angle and product
    var elevationProductLookup = {};
    // array to store elevations already "seen" in search for duplicates
    var seenElevs = [];
    // store all duplicate elevation angles
    var doubleElevs = [];
    for (var i in lEAP) {
        var angle = lEAP[i][0];
        // store the angle if it's a duplicate
        if (seenElevs.includes(angle)) { doubleElevs.push(angle) } else { seenElevs.push(angle) }

        // initialize the angle sub-object in our lookup table, if it doesn't exist
        if (!elevationProductLookup.hasOwnProperty(angle)) {
            elevationProductLookup[angle] = {};
        }
        var productsInElev = lEAP[i][2];
        var scanNumber = lEAP[i][1];
        // loop through all of the products contained in the current elevation angle
        for (var n in productsInElev) {
            // initialize the product sub-array in the angle sub-object of our lookup table, if it doesn't exist
            if (!elevationProductLookup[angle].hasOwnProperty(productsInElev[n])) {
                elevationProductLookup[angle][productsInElev[n]] = [];
            }
            // push the current scan number to the angle->product array in the lookup table
            elevationProductLookup[angle][productsInElev[n]].push(scanNumber);
        }
    }
    return elevationProductLookup;
}

function initEventListeners(l2rad, elevationProductLookup) {
    // we start with reflectivity
    window.atticData.currentProduct = 'REF';
    // sorts all the full elevations from least to greatest, and picks the lowest one
    window.atticData.fullAngle = Object.keys(elevationProductLookup).map(n => parseFloat(n)).sort(function(a, b) { return a - b })[0];
    // turn green the button that references the starting elevation
    $(`.l2ElevationBtn${dbs}[value="${window.atticData.fullAngle}"]`).addClass('l2ElevationBtnSelected');

    // make sure the correct product selection rows are showing
    var allProducts = l2rad.getAllProducts(); // get an array of all products in the radar file
    allProducts = allProducts.map(n => `l2-${n.toLowerCase()}`); // convert to the psmRow's abbreviation convention
    $('.l2prodSel').hide(); // hide all of the rows
    for (var i in allProducts) { $(`.l2prodSel[value="${allProducts[i]}"]`).show() } // show only the ones that are available

    $(`.l2ElevationBtn${dbs}`).click(function() {
        // turn all green buttons back to normal
        $(`.l2ElevationBtnSelected${dbs}`).removeClass('l2ElevationBtnSelected');
        // turn the current button green
        $(this).addClass('l2ElevationBtnSelected');

        var product = window.atticData.currentProduct; // e.g. 'VEL';

        var fullAngle = $(this).attr('value'); // e.g. 0.4833984375
        window.atticData.fullAngle = fullAngle; // store it globally

        var scanNumber = elevationProductLookup[fullAngle][product]; // e.g. 7
        scanNumber = parseInt(scanNumber[0]); // take the first in the array and convert to INT
        window.atticData.currentScanNumber = scanNumber; // store it globally

        l2plot(l2rad, product, scanNumber); // plot the current product and selected elevation
    })

    $('.psmRow').click(function() {
        var product = $(this).attr('value'); // e.g. l2-vel
        product = product.replace('l2-', '').toUpperCase(); // l2-vel --> VEL
        window.atticData.currentProduct = product; // store it globally

        var scanNumber = elevationProductLookup[window.atticData.fullAngle][product]; // e.g. 7
        scanNumber = parseInt(scanNumber[0]); // take the first in the array and convert to INT
        window.atticData.currentScanNumber = scanNumber; // store it globally

        if (product == 'VEL') {
            $('#completeDealiasBtnContainer').show();
        } else {
            $('#completeDealiasBtnContainer').hide();
        }

        l2plot(l2rad, product, scanNumber); // plot the selected product and the current elevation
    })

    $('#dealiasBtn').click(function() {
        if ($(this).hasClass('dealiasBtnDeSelected')) {
            // we're turning dealias mode ON
            window.atticData.shouldPlotDealiased = true;
            $(this).removeClass('dealiasBtnDeSelected').addClass('dealiasBtnSelected');
            $(this).find('i').removeClass('fa-xmark').addClass('fa-check');
        } else if ($(this).hasClass('dealiasBtnSelected')) {
            // we're turning dealias mode OFF
            window.atticData.shouldPlotDealiased = false;
            $(this).removeClass('dealiasBtnSelected').addClass('dealiasBtnDeSelected');
            $(this).find('i').removeClass('fa-check').addClass('fa-xmark');
        }

        if (window.atticData.currentProduct == 'VEL') {
            l2plot(l2rad, window.atticData.currentProduct, window.atticData.currentScanNumber);
        }
    })
}

// lEAP = listElevationsAndProducts
function l2menu(lEAP, l2rad) {
    // console.log(lEAP);

    var elevationProductLookup = _generateElevationProductLookup(lEAP);
    console.log(elevationProductLookup);

    var iters = 1; // track how many buttons have been added to the current row
    var completeHTML = ''; // string to store the complete "buttons div"
    var btnsInThisRow = ''; // string to store buttons in the current row - gets reset every new row
    var duplicateElevs = []; // array to track duplicate elevations
    for (var i in lEAP) {
        var elevationAngle = lEAP[i][0]; // elevation angle in degrees, e.g. 0.4833984375
        var elevationNumber = lEAP[i][1]; // the iteration from the base sweep, e.g. 7
        var elevationProducts = lEAP[i][2]; // array listing all of the products in the elevation, e.g. ['REF', 'VEL', 'SW ']
        var elevationWFT = lEAP[i][3]; // waveform type

        if (!duplicateElevs.includes(elevationAngle)) {
            duplicateElevs.push(elevationAngle);

            var btnHTML = _generateBtnTemplate(elevationAngle); // generate the single button template for the current angle
            btnsInThisRow += btnHTML; // add the button to the current row
            if (iters % 3 == 0 && iters != 1) { // every three buttons, but not the first iteration
                completeHTML += _generateRow(btnsInThisRow); // generate the row from the buttons and add to the final HTML string
                btnsInThisRow = ''; // reset the string to hold the row's buttons
            }
            iters++; // increase the counter
        }
    }
    if (btnsInThisRow != '') {
        completeHTML += _generateRow(btnsInThisRow); // if there are leftover buttons, generate a row with the remaining buttons
    }
    $('#l2ElevationButtons').html(completeHTML); // add the complete "buttons div" to the DOM
    $('#upload_psm').show(); // show the parent div for the elevation buttons and the psmRows

    initEventListeners(l2rad, elevationProductLookup); // initialize the event listeners for all of these buttons
}

module.exports = l2menu;