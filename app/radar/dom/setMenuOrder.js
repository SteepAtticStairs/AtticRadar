function setFooterMenuOrder() {
    $('#colorPickerItemDiv').insertAfter('#metarStationMenuItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#metarStationMenuItemDiv');

    $('#toolsItemDiv').insertAfter('#colorPickerItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#colorPickerItemDiv');
}

module.exports = {
    setFooterMenuOrder
};