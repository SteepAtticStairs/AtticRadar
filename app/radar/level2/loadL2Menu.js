const ut = require('../utils');

function loadL2Menu(elevsAndProds) {
    $('#dataDiv').data('elevsAndProds', elevsAndProds);
    console.log(elevsAndProds)
    function returnBtnTemplate(elevAngle, elevNum) {
        // var btnTemplate = `
        //     <button type="button"
        //     value="${elevNum}"
        //     id="elevBtn${elevNum}"
        //     class="btn btn-secondary btn-sm">
        //         ${elevAngle}
        //     </button>`
        var btnTemplate = `
            <input class="form-check-input radio-inline" type="radio" name="radios" id="elev${elevNum}" value="${elevNum}" valTag="${elevNum}">
            <label class="form-check-label" valTag="${elevNum}">${elevAngle}
            &nbsp;&nbsp;&nbsp;&nbsp;`
        return btnTemplate;
    }

    var l2btnsElem = document.getElementById('l2ElevBtns');
    for (key in elevsAndProds) {
        if (key % 3 == 0 && key != 0) {
            l2btnsElem.innerHTML += '<br>'
        }
        var curElevAngle = elevsAndProds[key][0];
        // round to one decimal place
        // curElevAngle = Math.round(curElevAngle * 10) / 10;
        curElevAngle = curElevAngle.toFixed(1);
        var curElevNum = elevsAndProds[key][1];

        l2btnsElem.innerHTML += returnBtnTemplate(curElevAngle, curElevNum);
    }
    // add some space at the bottom to allow the user to see the entire dropdown menu
    l2btnsElem.innerHTML += '<br><br><br><br>'
}

module.exports = loadL2Menu;