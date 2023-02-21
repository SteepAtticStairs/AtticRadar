const { plot } = require('../../../../lib/nexrad-level-2-plot/src');
const loaders = require('../../loaders');
const mapFuncs = require('../../map/mapFunctions');

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

var minOrMax = 'min';
var heightModifier = 10;
var curElevNum = 1;
var curProduct = 'REF';

function loadL2Listeners(l2rad) {
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

    $('.l2ProductOption').on('click', function() {
        var thisInnerHTML = $(this).html();
        var thisValue = $(this).attr('value');

        curProduct = valueProductLookup[thisValue];
        //$('#dataDiv').data('curL2Product', curProduct);
        plot(l2rad, curProduct, {
            elevations: curElevNum,
        });
    })


    // var btnsArr = [
    //     'level2-ref',
    //     'level2-vel',
    //     'level2-rho',
    //     'level2-phi',
    //     'level2-zdr',
    //     'level2-sw '
    // ]
    // for (key in btnsArr) {
    //     var curElemIter = document.getElementById(btnsArr[key]);
    //     curElemIter.disabled = false;
    // }

    // $('.l2BtnGroup button').on('click', function () {
    //     if (this.value == 'level2-ref') {
    //         const level2Plot = plot(l2rad, 'REF', {
    //             elevations: 1,
    //         });
    //     } else if (this.value == 'level2-vel') {
    //         const level2Plot = plot(l2rad, 'VEL', {
    //             elevations: 2,
    //         });
    //     } else if (this.value == 'level2-rho') {
    //         const level2Plot = plot(l2rad, 'RHO', {
    //             elevations: 1,
    //         });
    //     } else if (this.value == 'level2-phi') {
    //         const level2Plot = plot(l2rad, 'PHI', {
    //             elevations: 1,
    //         });
    //     } else if (this.value == 'level2-zdr') {
    //         const level2Plot = plot(l2rad, 'ZDR', {
    //             elevations: 1,
    //         });
    //     } else if (this.value == 'level2-sw ') {
    //         const level2Plot = plot(l2rad, 'SW ', {
    //             elevations: 7,
    //         });
    //     }
    // })


    // function hideShowArrows(val) {
    //     console.log(val)
    //     var dupElevObj = $('#dataDiv').data('duplicateElevs');
    //     for (const key in dupElevObj) {
    //         if (dupElevObj[key].includes(val.toString())) {
    //             if (dupElevObj[key].length > 1) {
    //                 $('.elevNavBtns').show();
    //                 var max = dupElevObj[$('#dataDiv').data('firstElev')].length - 1;
    //                 var min = 0;
    //                 document.getElementById('numOfElevsForArrows').innerHTML = `${min} / ${max}`;
    //             } else {
    //                 $('.elevNavBtns').hide();
    //                 document.getElementById('numOfElevsForArrows').innerHTML = '';
    //                 $('#dataDiv').data('curArrowElev', 0);
    //             }
    //         }
    //     }
    // }

    // // <li><a class='dropdown-item' href='#' value='tilt1'>Tilt 1</a></li>
    // function returnDropdownItem(value) {
    //     var dropdownItem = `<li><a class='dropdown-item' href='#' value='${value}'>${value}</a></li>`;
    //     return dropdownItem;
    // }

    // var dropdownBtn = document.getElementById('l2ProductBtn');
    // var allProds = ['REF', 'VEL', 'RHO', 'PHI', 'ZDR', 'SW '];
    // for (key in allProds) {
    //     document.getElementById('l2ProductMenu').innerHTML += returnDropdownItem(allProds[key])
    // }
    // dropdownBtn.innerHTML = 'REF';
    // $(dropdownBtn).attr('value', 'REF');
    // $('#dataDiv').data('currentL2Product', 'REF');
    // $('#dataDiv').data('currentElevation', 1);

    // $('#l2ProductBtn').attr('value', 'REF');
    // $('#l2ElevBtns').on('click', function(e) {
    //     var clickedValue = $(e.target).attr('value');
    //     $('#dataDiv').data('currentElevation', clickedValue);
    //     var allProdsForElev = $('#dataDiv').data('elevsAndProds')[clickedValue - 1][2];

    //     hideShowArrows(clickedValue);

    //     // document.getElementById('l2ProductMenu').innerHTML = '';
    //     // for (key in allProdsForElev) {
    //     //     document.getElementById('l2ProductMenu').innerHTML += returnDropdownItem(allProdsForElev[key])
    //     // }

    //     if (!(allProdsForElev.includes(dropdownBtn.innerHTML))) {
    //         dropdownBtn.innerHTML = 'REF';
    //         $(dropdownBtn).attr('value', 'REF');
    //         $('#dataDiv').data('currentL2Product', 'REF');
    //     }

    //     plot(l2rad, $('#l2ProductBtn').attr('value'), {
    //         elevations: parseInt(clickedValue),
    //     });
    // })

    // function showSpecificElevs(val) {
    //     $('[valTag]').hide();
    //     var elevsAndProds = $('#dataDiv').data('elevsAndProds');
    //     for (key in elevsAndProds) {
    //         var elevNum = elevsAndProds[key][1];
    //         if (elevsAndProds[key][2].includes(val)) {
    //             $(`[valTag=${parseInt(key) + 1}]`).show();
    //         }
    //     }
    // }

    // $('#dataDiv').data('currentL2Product', 'REF');
    // $('#l2ProductMenu').on('click', function(e) {
    //     var clickedVal = $(e.target).attr('value');
    //     $('#dataDiv').data('currentL2Product', clickedVal);

    //     document.getElementById('l2ProductBtn').innerHTML = clickedVal;
    //     $('#l2ProductBtn').attr('value', clickedVal);

    //     if (!$('#elevOptionsSwitch').is(':checked')) {
    //         showSpecificElevs(clickedVal);
    //     }

    //     // plot(l2rad, clickedVal, {
    //     //     elevations: parseInt($('#dataDiv').data('currentElevation')),
    //     // });
    // })

    // $('#elevOptionsSwitch').on('input', function() {
    //     // https://stackoverflow.com/a/68162025
    //     var isChecked = $(this).is(':checked');

    //     // if it is checked, show all elevations regardless of the products avaliable.
    //     // if it is not checked, only show elevations that have the selected product.

    //     if (isChecked) {
    //         $('[valTag]').show();
    //     } else if (!isChecked) {
    //         showSpecificElevs($('#dataDiv').data('currentL2Product'));
    //     }
    // })

    // $('#dataDiv').data('curArrowElev', 0);
    // $('#elevNavBtns button').on('click', function() {
    //     var leftOrRight = $(this).attr('value');
    //     var curElevNum = $('#dataDiv').data('currentElevation');
    //     var dupElevObj = $('#dataDiv').data('duplicateElevs');

    //     for (const key in dupElevObj) {
    //         if (dupElevObj[key].includes(curElevNum.toString())) {
    //             if (dupElevObj[key].length > 1) {
    //                 var elevToGoTo;
    //                 var max = dupElevObj[key].length - 1;
    //                 var min = 0;

    //                 if (leftOrRight == 'left') {
    //                     var subtractor = 0;
    //                     if (!($('#dataDiv').data('curArrowElev') == min)) {
    //                         subtractor = 1;
    //                     }
    //                     $('#dataDiv').data('curArrowElev', $('#dataDiv').data('curArrowElev') - subtractor);
    //                     elevToGoTo = parseInt(dupElevObj[key][$('#dataDiv').data('curArrowElev')])
    //                 } else if (leftOrRight == 'right') {
    //                     var adder = 0;
    //                     if (!($('#dataDiv').data('curArrowElev') == max)) {
    //                         adder = 1;
    //                     }
    //                     $('#dataDiv').data('curArrowElev', $('#dataDiv').data('curArrowElev') + adder);
    //                     elevToGoTo = parseInt(dupElevObj[key][$('#dataDiv').data('curArrowElev')]);
    //                 }

    //                 var curOverMax = `${$('#dataDiv').data('curArrowElev')} / ${max}`
    //                 document.getElementById('numOfElevsForArrows').innerHTML = curOverMax;

    //                 plot(l2rad, $('#dataDiv').data('currentL2Product'), {
    //                     elevations: elevToGoTo,
    //                 });
    //             }
    //         }
    //     }
    // })
}

module.exports = {
    loadL2Listeners,
    hoverClickBtnsListeners
};