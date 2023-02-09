function setFooterMenuOrder() {
    $('#colorPickerItemDiv').insertAfter('#metarStationMenuItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#metarStationMenuItemDiv');

    $('#settingsItemDiv').insertAfter('#colorPickerItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#colorPickerItemDiv');

    $('#toolsItemDiv').insertAfter('#settingsItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#settingsItemDiv');
}

module.exports = {
    setFooterMenuOrder
};