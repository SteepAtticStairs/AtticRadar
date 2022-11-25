const ut = require('../utils');
const isMobile = require('../misc/detectmobilebrowser');
const { plot } = require('../../../lib/nexrad-level-2-plot/src');

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
var minOrMax = 'min';
var heightModifier = 10;
var curElevNum = 1;
var curProduct = 'REF';

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

// https://stackoverflow.com/a/15191130/18758797
$.fn.animateRotate = function (angle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step;
    return this.each(function (i, e) {
        args.complete = $.proxy(args.complete, e);
        args.step = function (now) {
            $.style(e, 'transform', 'rotate(' + now + 'deg)');
            if (step) return step.apply(e, arguments);
        };

        $({ deg: 0 }).animate({ deg: angle }, args);
    });
};

function flipIcon(icon, minimizeOrMaximize) {
    function rotateThing(deg) {
        $(icon).animateRotate(deg, {
            duration: 200,
            easing: 'swing',
            complete: function () {},
            step: function () {}
        });
    }
    if (minimizeOrMaximize == 'minimize') {
        $(icon).removeClass('fa-chevron-right');
        $(icon).addClass('fa-chevron-down');
        rotateThing(-90);
    } else if (minimizeOrMaximize == 'maximize') {
        $(icon).removeClass('fa-chevron-down');
        $(icon).addClass('fa-chevron-right');
        rotateThing(90);
    }
}

window.valueProductLookup = {
    'l2-ref': 'REF',
    'l2-vel': 'VEL',
    'l2-rho': 'RHO',
    'l2-zdr': 'ZDR',
    'l2-sw ': 'SW ',
    'l2-phi': 'PHI'
}

function returnDropdownItem(value) {
    var dropdownItem = `<li><a class='dropdown-item' href='#' value='${value}'>${value}</a></li>`;
    return dropdownItem;
}

function nodeToString(node) {
    var tmpNode = document.createElement('div');
    tmpNode.appendChild(node.cloneNode(true));
    var str = tmpNode.innerHTML;
    tmpNode = node = null; // prevent memory leaks in IE
    return str;
}

function hoverClickBtnsListeners(l2rad) {
    function getBrightnessCss(val) {
        return {
            'filter': `brightness(${val}%)`,
            '-webkit-filter': `brightness(${val}%)`,
            '-moz-filter': `brightness(${val}%)`,
        }
    }

    // mousedown touchstart
    $('.l2ElevBtn')
        .on('mouseenter', function() { $(this).css(getBrightnessCss(90)) })
        .on('mouseleave', function() { $(this).css(getBrightnessCss(100)) })
        .on('mousedown', function() { $(this).css(getBrightnessCss(80)) })
        .on('mouseup', function() { $(this).css(getBrightnessCss(90)) })
    // $('.l2ElevBtn').on('mouseup touchend', function() {
    //     $(this).removeClass('l2ElevBtnClicked');
    // })

    $('.l2ElevBtn').on('click', function() {
        var clickedElevNum = $(this).attr('value');
        var clickedElevAngle = $(this).text();
        window.clickedElevNum = clickedElevNum;
        window.clickedElevAngle = clickedElevAngle;

        $('.l2ElevBtnSelected').removeClass('l2ElevBtnSelected');
        $(this).addClass('l2ElevBtnSelected');

        curElevNum = parseInt(clickedElevNum);
        plot(l2rad, curProduct, {
            elevations: curElevNum,
        });
    })
}

function loadL2Menu(elevsAndProds, l2rad) {
    $('#dataDiv').data('elevsAndProds', elevsAndProds);
    console.log(elevsAndProds)
    generateElevsForEachProduct(elevsAndProds);

    var keys = Object.keys(elevsForEachProduct);
    for (var i in keys) {
        if (elevsForEachProduct[keys[i]] == '') {
            $(`.l2ProductOption[value='l2-${keys[i].toLowerCase()}']`).hide();
        }
    }

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
        function pushRow() {
            l2btnsElem.innerHTML += `<div class="row gx-1" style="margin-top: 0.25rem">${allBtns}</div>`
            allBtns = '';
        }
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
                allBtns += returnBtnTemplate(curElevAngle, curElevNum);
                // do every three buttons (3 per row),
                // but not the first iteration, because we haven't generated a full row of 3 yet
                if (iters % 3 == 0 && iters != 1) { pushRow() }
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
        // if the loop has finished and we haven't reached a row a 3 yet, append the remaining buttons
        if (allBtns != '') { pushRow() }

        $('#dataDiv').data('allButtonsArr', allBtnsArr);
        $('#dataDiv').data('elevsForEachProduct', elevsForEachProduct);
        hoverClickBtnsListeners(l2rad);
    }

    //$('#dataDiv').data('curL2Product', 'REF')
    generateElevBtns('REF');
    $(`.l2ElevBtn[value='1']`).addClass('l2ElevBtnSelected');
    var firstElevAngle = $(`.l2ElevBtn[value='1']`).text();
    var firstElevNum = $(`.l2ElevBtn[value='1']`).attr('value');
    window.clickedElevAngle = firstElevAngle;
    window.clickedElevNum = firstElevNum;

    $('.l2ProductOption').on('click', function() {
        var thisInnerHTML = $(this).html();
        var thisValue = $(this).attr('value');

        curProduct = window.valueProductLookup[thisValue];
        generateElevBtns(curProduct);

        // if the new product selection does not have the currently selected elevation,
        // use the same elevation angle but a different elevation number
        if (!elevsForEachProduct[curProduct].includes(parseInt(window.clickedElevNum))) {
            $('.l2ElevBtn').each(function() {
                if ($(this).text() == window.clickedElevAngle) {
                    window.clickedElevNum = $(this).attr('value');
                }
            })
        }

        $('.l2ElevBtnSelected').removeClass('l2ElevBtnSelected');
        $(`.l2ElevBtn[value='${window.clickedElevNum}']`).addClass('l2ElevBtnSelected');

        curProduct = valueProductLookup[thisValue];
        //$('#dataDiv').data('curL2Product', curProduct);
        plot(l2rad, curProduct, {
            elevations: parseInt(window.clickedElevNum),
        });
    })

    $('#currentModeSpan').hide();
    $('#uploadModeSpan').show();

    $('#l2ElevButtonsExpander').on('click', function() {
        if (minOrMax == 'min') {
            $('.l2ElevButtons').slideDown(200);
            minOrMax = 'max';
            $(this).addClass('l2ElevButtonsExpanderSelected').animate({
                //'padding': '1.5px',
                'height': `-=${heightModifier}`
            }, {duration: 200, queue: false});
            $('#l2ElevButtonsExpanderIcon').animate({
                'font-size': '12px'
            }, {duration: 200, queue: false});
            flipIcon($('#l2ElevButtonsExpanderIcon'), 'maximize');
        } else if (minOrMax == 'max') {
            $('.l2ElevButtons').slideUp(200);
            minOrMax = 'min';
            $(this).removeClass('l2ElevButtonsExpanderSelected').animate({
                //'padding': '5px',
                'height': `+=${heightModifier}`
            }, {duration: 200, queue: false});
            $('#l2ElevButtonsExpanderIcon').animate({
                'font-size': '18px'
            }, {duration: 200, queue: false});
            flipIcon($('#l2ElevButtonsExpanderIcon'), 'minimize');
        }
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