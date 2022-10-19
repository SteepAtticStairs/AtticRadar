const createOffCanvasItem = require('../../radar/menu/createOffCanvasItem');
const initHurricaneArchiveListeners = require('./eventListeners');
const parseHurricaneFile = require('./plotIBTRACS');
const ut = require('../../radar/utils');
var map = require('../../radar/map/map');

function startRightAway() {
    // hurricane michael
    var id = '2018280N18273';
    $.getJSON(`https://raw.githubusercontent.com/SteepAtticStairs/hurricaneArchives/main/IBTrACS/storms/${id}.json`, function(data) {
        parseHurricaneFile(data, id);
        ut.haMapControlActions('show');
    })
}

createOffCanvasItem({
    'id': 'historicalHurricanesMenuItem',
    'class': 'alert alert-secondary offCanvasMenuItem',
    'contents': 'Hurricane Archive',
    'icon': 'fa fa-hurricane',
    'css': ''
}, function(thisObj, innerDiv, iconElem) {
    $('#hurricaneArchiveModalTrigger').click();
    ut.haMapControlActions('show');
})

initHurricaneArchiveListeners();

$('#haClearMap').on('click', function() {
    ut.haMapControlActions('hide');

    var haMapLayers = $('#dataDiv').data('haMapLayers');
    for (var i in haMapLayers) {
        //map.setLayoutProperty(haMapLayers[i], 'visibility', 'none');
        if (map.getLayer(haMapLayers[i])) {
            map.removeLayer(haMapLayers[i]);
        }
    }
    for (var i in haMapLayers) {
        if (map.getSource(haMapLayers[i])) {
            map.removeSource(haMapLayers[i]);
        }
    }
})

$('#dataDiv').data('isHaControlMinimized', false);

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

function flipIcon(minimizeOrMaximize) {
    function rotateThing(deg) {
        $('#haMapControlMinimizeIcon').animateRotate(deg, {
            duration: 250,
            easing: 'linear',
            complete: function () {},
            step: function () {}
        });
    }
    if (minimizeOrMaximize == 'minimize') {
        $('#haMapControlMinimizeIcon').removeClass('fa-chevron-right');
        $('#haMapControlMinimizeIcon').addClass('fa-chevron-left');
        rotateThing(180);
    } else if (minimizeOrMaximize == 'maximize') {
        $('#haMapControlMinimizeIcon').removeClass('fa-chevron-left');
        $('#haMapControlMinimizeIcon').addClass('fa-chevron-right');
        rotateThing(-180);
    }
}

$('#haMapControlMinimize').on('click', function() {
    var buffer = 4;
    //var widthToSubtract = $('#hurricaneArchiveMapControl').width() - $('#haMapControlMinimize').width();
    if (!$('#dataDiv').data('isHaControlMinimized')) {
        $('#dataDiv').data('isHaControlMinimized', true);

        $('#haClearMapOuter').css('max-height', $('#haClearMapOuter').height());
        $('#haMapControlText').css('max-height', $('#haMapControlText').height());
        $('.haClearBtnContents').css('visibility', 'hidden');
        $('#hurricaneArchiveMapControl').css('overflow', 'hidden');

        flipIcon('minimize');

        $('#hurricaneArchiveMapControl').animate({
            width: $('#haMapControlMinimize').width() + buffer,
        }, 250)
    } else if ($('#dataDiv').data('isHaControlMinimized')) {
        $('#dataDiv').data('isHaControlMinimized', false);
        $('#haClearMapOuter').css('visibility', 'visible');
        $('.haClearBtnContents').css('visibility', 'hidden');

        flipIcon('maximize');

        var el = $('#hurricaneArchiveMapControl'),
            curWidth = el.width(),
            autoWidth = el.css('width', 'fit-content').width();
        el.width(curWidth).animate({
            width: autoWidth + buffer
        }, 250, function() {
            el.css('width', 'fit-content');
            $('#haClearMapOuter').css('max-height', '');
            $('#haMapControlText').css('max-height', '');
            $('.haClearBtnContents').css('visibility', 'visible');
            $('#hurricaneArchiveMapControl').css('overflow', 'scroll');
        });
    }
})

function shouldStartRightAway() {
    if (!map.loaded()) {
        map.on('load', function() {
            startRightAway();
        })
    } else {
        startRightAway();
    }
}
shouldStartRightAway();