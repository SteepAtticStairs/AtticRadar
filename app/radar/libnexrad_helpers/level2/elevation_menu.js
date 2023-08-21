function _generateBtnTemplate(angle, number) {
    return `<div class="col">
        <div class="l2ElevationBtn" value="${angle}" number="${number}">${angle.toFixed(1)}°</div>
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

function _enable_correct_buttons(lEAP) {
    // make sure the correct product selection rows are available
    $('.psmRowDisabled').removeClass('psmRowDisabled'); // reset all of the rows
    const moments = lEAP[window.atticData.currentScanNumber - 1][2]; // scan number indices start at 1, lEAP indices start at 0
    ['REF', 'VEL', 'RHO', 'PHI', 'ZDR', 'SW'].forEach(prop => { // loop through all possible moments
        const formatted_moment = `l2-${prop.toLowerCase()}`; // convert to the psmRow's abbreviation convention
        if (!moments.includes(prop)) { // if the current elevation doesn't contain the moment
            $(`.l2prodSel[value="${formatted_moment}"]`).addClass('psmRowDisabled'); // disable the corresponding psmRow
        }
    })
    // make sure the correct elevation buttons are available
    $('.l2ElevationBtnDisabled').removeClass('l2ElevationBtnDisabled'); // reset all of the buttons
    for (var i = 0; i < lEAP.length; i++) { // loop through the lEAP
        const scan_number = i + 1; // scan number indices start at 1, lEAP indices start at 0
        const moments = lEAP[i][2]; // all the moments in the elevation number
        if (!moments.includes(window.atticData.currentProduct)) { // if the elevation number does not contain the current product
            $(`.l2ElevationBtn[number="${scan_number}"]`).addClass('l2ElevationBtnDisabled'); // disable the corresponding elevation button
        }
    }
}

function initEventListeners(L2Factory, lEAP, elevationProductLookup) {
    // we start with reflectivity
    window.atticData.currentProduct = 'REF';
    // we start at 1
    window.atticData.currentScanNumber = 1;
    // sorts all the full elevations from least to greatest, and picks the lowest one
    window.atticData.fullAngle = Object.keys(elevationProductLookup).map(n => parseFloat(n)).sort(function(a, b) { return a - b })[0];
    // turn green the button that references the starting elevation
    $(`.l2ElevationBtn${dbs}[number="${window.atticData.currentScanNumber}"]`).addClass('l2ElevationBtnSelected');

    // make sure the correct buttons are available
    _enable_correct_buttons(lEAP);

    $(`.l2ElevationBtn${dbs}`).click(function() {
        // turn all green buttons back to normal
        $(`.l2ElevationBtnSelected${dbs}`).removeClass('l2ElevationBtnSelected');
        // turn the current button green
        $(this).addClass('l2ElevationBtnSelected');

        var product = window.atticData.currentProduct; // e.g. 'VEL';

        var fullAngle = $(this).attr('value'); // e.g. 0.4833984375
        window.atticData.fullAngle = fullAngle; // store it globally

        var scanNumber = parseInt($(this).attr('number')); // e.g. 7
        window.atticData.currentScanNumber = scanNumber; // store it globally

        // make sure the correct buttons are available
        _enable_correct_buttons(lEAP);

        L2Factory.plot(product, scanNumber); // plot the current product and selected elevation
    })

    function _toggle_dealias_btn(product) {
        if (product == 'VEL') {
            $('#completeDealiasBtnContainer').show();
        } else {
            $('#completeDealiasBtnContainer').hide();
        }
    }

    function _psm_click() {
        $('#productsDropdownTriggerText').text($(this).text()); // e.g. "Velocity"
        var product = $(this).attr('value'); // e.g. l2-vel
        product = product.replace('l2-', '').toUpperCase(); // l2-vel --> VEL
        window.atticData.currentProduct = product; // store it globally

        var scanNumber = window.atticData.currentScanNumber; // e.g. 7

        // make sure the correct buttons are available
        _enable_correct_buttons(lEAP);

        _toggle_dealias_btn(product);

        L2Factory.plot(product, scanNumber); // plot the selected product and the current elevation
    }
    $('.psmRow.l2prodSel').off('click'); // disable all prior listeners
    $('.psmRow.l2prodSel').click(_psm_click);

    _toggle_dealias_btn('REF');
    $('#dealiasBtn').off();
    $('#dealiasBtn').click(function() {
        if ($(this).hasClass('dealiasBtnDeSelected')) {
            // we're turning dealias mode ON
            window.atticData.should_plot_dealiased = true;
            $(this).removeClass('dealiasBtnDeSelected').addClass('dealiasBtnSelected');
            $(this).find('i').removeClass('fa-xmark').addClass('fa-check');
        } else if ($(this).hasClass('dealiasBtnSelected')) {
            // we're turning dealias mode OFF
            window.atticData.should_plot_dealiased = false;
            $(this).removeClass('dealiasBtnSelected').addClass('dealiasBtnDeSelected');
            $(this).find('i').removeClass('fa-check').addClass('fa-xmark');
        }

        if (window.atticData.currentProduct == 'VEL') {
            L2Factory.plot(window.atticData.currentProduct, window.atticData.currentScanNumber);
        }
    })
}

function load_elevation_menu(lEAP) {
    var elevationProductLookup = _generateElevationProductLookup(lEAP);
    console.log(lEAP);
    console.log(elevationProductLookup);

    var iters = 1; // track how many buttons have been added to the current row
    var completeHTML = ''; // string to store the complete "buttons div"
    var btnsInThisRow = ''; // string to store buttons in the current row - gets reset every new row
    for (var i in lEAP) {
        var elevationAngle = lEAP[i][0]; // elevation angle in degrees, e.g. 0.4833984375
        var elevationNumber = lEAP[i][1]; // the iteration from the base sweep, e.g. 7
        var elevationProducts = lEAP[i][2]; // array listing all of the products in the elevation, e.g. ['REF', 'VEL', 'SW ']
        var elevationWFT = lEAP[i][3]; // waveform type

        var btnHTML = _generateBtnTemplate(elevationAngle, elevationNumber); // generate the single button template for the current angle
        btnsInThisRow += btnHTML; // add the button to the current row
        if (iters % 3 == 0 && iters != 1) { // every three buttons, but not the first iteration
            completeHTML += _generateRow(btnsInThisRow); // generate the row from the buttons and add to the final HTML string
            btnsInThisRow = ''; // reset the string to hold the row's buttons
        }
        iters++; // increase the counter
    }
    if (btnsInThisRow != '') {
        completeHTML += _generateRow(btnsInThisRow); // if there are leftover buttons, generate a row with the remaining buttons
    }
    $('#l2ElevationButtons').html(completeHTML); // add the complete "buttons div" to the DOM
    $('.psm').hide();
    $('#level2_psm').show(); // show the parent div for the elevation buttons and the psmRows

    $('#productsDropdownTriggerText').text('Reflectivity'); // we start out with reflectivity
    initEventListeners(this, lEAP, elevationProductLookup); // initialize the event listeners for all of these buttons
}

module.exports = load_elevation_menu;