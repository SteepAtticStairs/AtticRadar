const ut = require('../utils');

function loadL2Menu(elevsAndProds) {
    $('#dataDiv').data('elevsAndProds', elevsAndProds);
    console.log(elevsAndProds)
    function returnBtnTemplate(elevAngle, elevNum) {
        var btnTemplate = `
            <button type="button"
            value="${elevNum}"
            id="elevBtn${elevNum}"
            class="btn btn-secondary btn-sm">
                ${elevAngle}
            </button>`
        return btnTemplate;
    }

    var l2btnsElem = document.getElementById('l2ElevBtns').innerHTML;
    var amountPerRow = 5;
    for (key in elevsAndProds) {
        if (key % amountPerRow == 0) {
            $('#dataDiv').data('curElevBtnGroupIter', `l2ElevBtnGroup${key / amountPerRow}`);
        }
        var curElevAngle = elevsAndProds[key][0];
        // round to one decimal place
        // curElevAngle = Math.round(curElevAngle * 10) / 10;
        curElevAngle = curElevAngle.toFixed(1);
        var curElevNum = elevsAndProds[key][1];

        document.getElementById($('#dataDiv').data('curElevBtnGroupIter')).innerHTML += returnBtnTemplate(curElevAngle, curElevNum);
    }
}

module.exports = loadL2Menu;