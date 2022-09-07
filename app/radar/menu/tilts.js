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
    // &nbsp;&nbsp;&nbsp;
    // <input class="form-check-input" type="radio" id="checkTilt1" name="inlineRadioOptions" value="1">
    // <label class="form-check-label" for="checkTilt1">1</label>
    document.getElementById('newTiltsMenu').innerHTML = '';
    for (key in tiltsArr) {
        var inputElem = document.createElement('input');
        inputElem.className = 'form-check-input';
        inputElem.id = `checkTilt${tiltsArr[key]}`;
        $(inputElem).attr('type', 'radio');
        $(inputElem).attr('name', 'inlineRadioOptions');
        $(inputElem).attr('value', `tilt${tiltsArr[key]}`);

        var labelElem = document.createElement('label');
        labelElem.className = 'form-check-label';
        labelElem.innerHTML = tiltsArr[key];
        $(labelElem).attr('for', `checkTilt${tiltsArr[key]}`);
        $(labelElem).attr('value', `tilt${tiltsArr[key]}`);

        document.getElementById('newTiltsMenu').appendChild(document.createTextNode('\u00A0\u00A0\u00A0'));
        document.getElementById('newTiltsMenu').appendChild(inputElem);
        document.getElementById('newTiltsMenu').appendChild(document.createTextNode('\u00A0'));
        document.getElementById('newTiltsMenu').appendChild(labelElem);
        // // add the tilt option to the dropdown
        // document.getElementById('tiltsMenu').appendChild(lineElem);
        // // if it is the first element in the tilts array, set the dropdown button to read that first element
        // if (key == 0) {
        //     document.getElementById('tiltsDropdownBtn').innerHTML = `Tilt ${tiltsArr[key]}`;
        // }
    }
    // if you want a callback after the tilts have been loaded
    if (callback) callback();
}

function tiltEventListeners() {
    $('#newTiltsMenu').on('click', function(e) {
        var clickedValue = $(e.target).attr('value');
        document.getElementById('tiltsDropdownBtn').innerHTML = `Tilt ${clickedValue.slice(-1)}`;
        $('#tiltsDropdownBtn').attr('value', clickedValue);

        var clickedProduct = ut.tiltObject[$('#tiltsDropdownBtn').attr('value')][$('#dataDiv').data('curProd')];
        var currentStation = $('#stationInp').val();
        loaders.getLatestFile(currentStation, [3, clickedProduct, 0], function (url) {
            console.log(url);
            loaders.loadFileObject(ut.phpProxy + url, 3, 0);
        })
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