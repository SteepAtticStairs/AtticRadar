function setFooterMenuOrder() {
    $('#colorPickerItemDiv').insertAfter('#metarStationMenuItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#metarStationMenuItemDiv');

    $('#settingsItemDiv').insertAfter('#metarStationMenuItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#metarStationMenuItemDiv');

    $('#toolsItemDiv').insertAfter('#settingsItemDiv'); // colorPickerItemDiv
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#settingsItemDiv'); // colorPickerItemDiv
}

module.exports = {
    setFooterMenuOrder
};