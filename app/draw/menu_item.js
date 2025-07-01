const draw_functions = require('./draw_functions');

const div_elem = '#drawMenuItemDiv';
const icon_elem = '#drawMenuItemIcon';

$(icon_elem).on('click', function () {
    if (!$(icon_elem).hasClass('menu_item_selected')) {
        $(icon_elem).addClass('menu_item_selected');
        $(icon_elem).removeClass('menu_item_not_selected');

        if ($('#colorPickerItemClass').hasClass('menu_item_selected')) {
            $('#colorPickerItemClass').click();
        }

        draw_functions.enable_drawing();
    } else if ($(icon_elem).hasClass('menu_item_selected')) {
        $(icon_elem).removeClass('menu_item_selected');
        $(icon_elem).addClass('menu_item_not_selected');

        draw_functions.disable_drawing();
    }
})

function _disable() {
    $(icon_elem).removeClass('menu_item_selected');
    $(icon_elem).addClass('menu_item_not_selected');
    draw_functions.disable_drawing();
}
$('#colorPickerItemDiv').on('click', function () {
    if ($(this).find('span').hasClass('menu_item_selected')) {
        _disable();
    }
})
$('#settingsItemDiv').on('click', function () {
    _disable();
})