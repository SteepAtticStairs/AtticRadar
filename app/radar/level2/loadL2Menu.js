const ut = require('../utils');
const isMobile = require('../misc/detectmobilebrowser');
const hoverClickBtnsListeners = require('./eventListeners').hoverClickBtnsListeners;

function createModal(title, headerColor, body) {
    var modalContent = 
    `<div class="modal fade" id="jsModal" tabindex="-1" aria-labelledby="jsModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header alert ${headerColor}">
                    <h5 class="modal-title" id="jsModalLabel">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="jsModalBody">${body}</div>
            </div>
        </div>
    </div>`
    return modalContent;
}

var elevsForEachProduct = {
    'REF': [],
    'VEL': [],
    'RHO': [],
    'ZDR': [],
    'SW ': [],
    'PHI': []
}
function generateElevsForEachProduct(elevsAndProds) {
    for (var i in elevsAndProds) {
        var curIterElevNum = parseInt(elevsAndProds[i][1]);
        var allProdsForCurElev = elevsAndProds[i][2];
        for (var n in allProdsForCurElev) {
            elevsForEachProduct[allProdsForCurElev[n]].push(curIterElevNum);
        }
    }
    console.log(elevsForEachProduct)
}

function loadL2Menu(elevsAndProds, l2rad) {
    $('#dataDiv').data('elevsAndProds', elevsAndProds);
    console.log(elevsAndProds)
    generateElevsForEachProduct(elevsAndProds);

    function returnBtnTemplate(elevAngle, elevNum) {
        // var btnTemplate = `
        //     <button type="button"
        //     value="${elevNum}"
        //     id="elevBtn${elevNum}"
        //     class="btn btn-secondary btn-sm">
        //         ${elevAngle}
        //     </button>`

        // var btnTemplate = `
        // <div class="col-sm">
        //     <input class="form-check-input radio-inline" type="radio" name="radios" id="elev${elevNum}" value="${elevNum}" valTag="${elevNum}"><label class="form-check-label" valTag="${elevNum}">${elevAngle}
        // </div>`
        var btnTemplate = `
        <div class="col">
            <div class="l2ElevBtn" value="${elevNum}">${elevAngle}°</div>
        </div>`
        return btnTemplate;
    }

    if (isMobile) {
        var warningModal = $(createModal(
            'Warning',
            'alert-warning',
            'You appear to be using a mobile device. Choosing a lot of different Level 2 elevations / products is likely to crash the webpage. You can either continue and see how much your phone can take, or you can switch to a desktop computer, and use the website there. You should NOT run into this issue on desktop.'));
        warningModal.modal('show');
    }

    var duplicateElevs = {};


    var l2btnsElem = document.getElementById('l2ElevButtons');
    var currentProduct;
    var allBtnsArr = [];

    function generateElevBtns(product) {
        $('#l2ElevButtons').empty();
        var base = elevsForEachProduct[product];
        var iters = 1;
        var allBtns = '';
        for (key in elevsAndProds) {
            // if (iters % 2 == 0 && iters != 0) {
            //     l2btnsElem.innerHTML += '<br>'
            // }
            var curElevAngle = elevsAndProds[key][0];
            // round to one decimal place
            // curElevAngle = Math.round(curElevAngle * 10) / 10;
            curElevAngle = curElevAngle.toFixed(1);
            var curElevNum = elevsAndProds[key][1];
            var curElevWaveformType = elevsAndProds[key][3];

            allBtnsArr.push(returnBtnTemplate(curElevAngle, curElevNum));

            if (base.includes(parseInt(curElevNum))) {
                function pushRow() {
                    l2btnsElem.innerHTML += `<div class="row gx-1" style="margin-top: 0.25rem">${allBtns}</div>`
                    allBtns = '';
                }
                allBtns += returnBtnTemplate(curElevAngle, curElevNum);
                // do every three buttons (3 per row),
                // but not the first iteration, because we haven't generated a full row of 3 yet
                if (iters % 3 == 0 && iters != 1) { pushRow() }
                // if the loop has finished and we haven't reached a row a 3 yet, append the remaining buttons
                if (iters == elevsAndProds.length) { pushRow() }
                iters++;
            }

            // // WVT = waveform type
            // var curElevCurWVT = `${curElevAngle}_${curElevWaveformType}`;
            // if (iters == 0) {
            //     $('#dataDiv').data('firstElev', curElevCurWVT);
            //     firstElev = curElevCurWVT;
            // }

            // if (duplicateElevs.hasOwnProperty(curElevCurWVT)) {
            //     duplicateElevs[curElevCurWVT].push(curElevNum);
            //     // // if (the current elevation's waveform type == the current iteration elevation's waveform type)
            //     // console.log(elevsAndProds[curElevNum - 1][3], curElevWaveformType)
            //     // if (elevsAndProds[curElevNum - 1][3] == curElevWaveformType) {
            //     //     duplicateElevs[curElevAngle].push(curElevNum);
            //     // }
            // } else {
            //     duplicateElevs[curElevCurWVT] = [curElevNum];
            //     l2btnsElem.innerHTML += returnBtnTemplate(curElevAngle, curElevNum);
            //     iters++;
            // }
        }
        $('#dataDiv').data('allButtonsArr', allBtnsArr);
        $('#dataDiv').data('elevsForEachProduct', elevsForEachProduct);
        hoverClickBtnsListeners(l2rad);
    }

    //$('#dataDiv').data('curL2Product', 'REF')
    generateElevBtns('REF');
    $('.l2ProductOption').on('click', function() {
        var thisInnerHTML = $(this).html();
        var thisValue = $(this).attr('value');

        curProduct = window.valueProductLookup[thisValue];
        generateElevBtns(curProduct);
        $('.l2ElevBtnSelected').removeClass('l2ElevBtnSelected');
        $(`.l2ElevBtn[value='${window.clickedElevNum}']`).addClass('l2ElevBtnSelected');
    })

    // console.log(duplicateElevs)
    // $('#dataDiv').data('duplicateElevs', duplicateElevs);

    // var max = duplicateElevs[firstElev].length - 1;
    // var min = 0;
    // document.getElementById('numOfElevsForArrows').innerHTML = `${min} / ${max}`;
    // if (duplicateElevs[firstElev].length == 1) {
    //     $('.elevNavBtns').hide();
    //     //$('#extraBreaks').hide();
    //     document.getElementById('numOfElevsForArrows').innerHTML = '';
    //     $('#dataDiv').data('curArrowElev', 0);
    // }

    // // add some space at the bottom to allow the user to see the entire dropdown menu
    // l2btnsElem.innerHTML += '<br><br><br><br>'

    // $("[valTag=1]").prop("checked", true);
}

module.exports = loadL2Menu;