var map = require('../../core/map/map');
const ut = require('../../core/utils');
const getValue = require('./get_value');

const divElem = '#colorPickerItemDiv';
const iconElem = '#colorPickerItemClass';

$(iconElem).on('click', function() {
    if (!$(iconElem).hasClass('menu_item_selected')) {
        $(iconElem).addClass('menu_item_selected');
        $(iconElem).removeClass('menu_item_not_selected');

        map.on('move', getValue);
        $('.colorPicker').show();
        $('#colorPickerText').hide();
        $('#colorPickerBorder').css('display', 'flex');

        // $(document).on('mousemove', function (e) {
        //     $('#colorPickerBorder').css({
        //         left: e.pageX - $('#colorPickerBorder').height() / 2,
        //         top: e.pageY - $('#colorPickerBorder').width() / 2,
        //     });
        //     $('#colorPicker').css({
        //         left: e.pageX - $('#colorPicker').height() / 2,
        //         top: e.pageY - $('#colorPicker').width() / 2,
        //     });
        //     $('#colorPickerBorder,#colorPicker').css('bottom', '');
        // });

        // if (window.l3rad != undefined) {
        //     if (window.prevl3rad != window.l3rad) {
        //         window.prevl3rad = window.l3rad;
        //         calculateVerticies(window.l3rad, 3, {
        //             'mode': 'geojson'
        //         });
        //     }
        // } else if (window.l2rad != undefined) {
        //     if (window.prevl2radOpt != window.l2radOptions) {
        //         window.prevl2radOpt = window.l2radOptions;

        //         var opt = window.l2radOptions;
        //         calculateVerticies(window.l2rad, 2, {
        //             'product': opt[0],
        //             'elevation': opt[1],
        //             'mode': 'geojson'
        //         });
        //     }
        // }
    } else if ($(iconElem).hasClass('menu_item_selected')) {
        $(iconElem).removeClass('menu_item_selected');
        $(iconElem).addClass('menu_item_not_selected');

        $('.colorPicker').hide();
        map.off('move', getValue);
    }
})