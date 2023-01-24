function setFooterMenuOrder() {
    $('#colorPickerItemDiv').insertAfter('#metarStationMenuItemDiv');
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#metarStationMenuItemDiv');

    $('#toolsItemDiv').insertAfter('#metarStationMenuItemDiv'); // colorPickerItemDiv
    $(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#metarStationMenuItemDiv'); // colorPickerItemDiv
}

module.exports = {
    setFooterMenuOrder
};