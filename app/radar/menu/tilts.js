const ut = require('../utils');
const loaders = require('../loaders');

/**
* Function to list a number of tilts to the dropdown menu.
*
* @param {any} tiltsArr - An array with the tilts to list in the dropdown. e.g. [1, 2, 3, 4]
* @param {any} callback - If you want a callback function after the DOM has been modified here.
*/
function listTilts(tiltsArr, callback) {
    //<li><a class="dropdown-item" href="#" value="tilt1">Tilt 1</a></li>
    $('#tiltsMenu').empty();
    for (key in tiltsArr) {
        // create an anchor element with the appropriate title and value
        var anchorElem = document.createElement('a');
        anchorElem.className = 'dropdown-item';
        anchorElem.href = '#';
        anchorElem.setAttribute('value', `tilt${tiltsArr[key]}`);
        anchorElem.innerHTML = `Tilt ${tiltsArr[key]}`

        // create a line element to wrap the anchor
        var lineElem = document.createElement('li');
        lineElem.appendChild(anchorElem)

        // add the tilt option to the dropdown
        document.getElementById('tiltsMenu').appendChild(lineElem);
        // if it is the first element in the tilts array, set the dropdown button to read that first element
        if (key == 0) {
            document.getElementById('tiltsDropdownBtn').innerHTML = `Tilt ${tiltsArr[key]}`;
        }
    }
    // if you want a callback after the tilts have been loaded
    if (callback) callback();
}

function tiltEventListeners() {
    $('#tiltsDropdown').on('click', function(e) {
        var clickTarget = $(e.target);
        if (clickTarget.parents().eq(1).attr('id') == 'tiltsMenu') {
            var clickedValue = clickTarget.attr('value');
            document.getElementById('tiltsDropdownBtn').innerHTML = `Tilt ${clickedValue.slice(-1)}`;
            $('#tiltsDropdownBtn').attr('value', clickedValue);

            var clickedProduct = ut.tiltObject[$('#tiltsDropdownBtn').attr('value')][$('#dataDiv').data('curProd')];
            var currentStation = $('#stationInp').val();
            loaders.getLatestFile(currentStation, [3, clickedProduct, 0], function(url) {
                console.log(url);
                loaders.loadFileObject(ut.phpProxy + url, 3, 0);
            })
        }
    })
}

function resetTilts() {
    document.getElementById('tiltsDropdownBtn').innerHTML = `Tilt 1`;
    $('#tiltsDropdownBtn').attr('value', 'tilt1');
}

module.exports = {
    listTilts,
    tiltEventListeners,
    resetTilts
}