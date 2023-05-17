var map = require('../core/map/map');
const ut = require('../core/utils');
const get_polygon_colors = require('./colors/polygon_colors');
const display_attic_dialog = require('../core/menu/attic_dialog');
const chroma = require('chroma-js')
const { DateTime } = require('luxon');

// https://www.geeksforgeeks.org/how-to-change-the-height-of-br-tag
const break_small = `<span style="display: block; margin-bottom: -.4em;"></span>`;
const break_large = `<span style="display: block; margin-bottom: 0.75em;"></span>`;

function click_listener(e) {
    var popupItem = '';
    var alertContentObj = {};
    var alreadyAddedWmoIDs = [];
    for (key in e.features) {
        var id = `${Date.now()}alert`;
        var properties = e.features[key].properties;
        var parameters = JSON.parse(properties.parameters);
        //console.log(e.features[key])
        // console.log(properties)
        var wmoId = parameters.WMOidentifier[0];
        if (!alreadyAddedWmoIDs.includes(wmoId)) {
        alreadyAddedWmoIDs.push(wmoId);

        var initColor = get_polygon_colors(properties.event).color;
        var backgroundColor = initColor;
        var borderColor = chroma(initColor).darken(1.5);
        var textColor = chroma(initColor).luminance() > 0.4 ? 'black' : 'white';
        //<i class="fa-solid fa-circle-info" style="font-size: 15px"></i>
        popupItem += `<div style="color: white; text-align: center;"><b class="extraAlertTextTrigger" id="${id}" style="
        text-align: center;
        width: auto;
        height: auto;
        padding: 1px 5px;
        background-color: ${backgroundColor};
        border: 2px solid ${borderColor};
        border-radius: 25px;
        cursor: pointer;
        color: ${textColor};
        "><i class="fa-solid fa-circle-info"></i> ${properties.event}</b>`;

        var lineSpace = '';
        var preStart = '<div style="margin-bottom: 0 !important">';
        var lineBreak = `<br>${preStart}`;
        var amountOfParams = 0;
        function addParameter(parameterName, textValueID) {
            if (parameters.hasOwnProperty(parameterName)) {
                if (amountOfParams == 0) { popupItem += lineBreak; }
                if (lineSpace == '' && amountOfParams != 0) { lineSpace = '&nbsp;&nbsp;&nbsp;'; }
                popupItem += `${lineSpace}<b>${textValueID}</b><b class="alertsMonospaceText" style="color: rgb(179, 143, 52)"> ${parameters[parameterName]}</b>`;
                amountOfParams++;
            }
        }
        addParameter('maxHailSize', 'Hail:');
        addParameter('maxWindGust', 'Wind:');
        addParameter('tornadoDetection', 'Tornado:');

        if (amountOfParams == 0) { popupItem += preStart; }

        var alertExpiresTime;
        var thingToPrepend;
        if (properties.hasOwnProperty('ends')) {
            alertExpiresTime = properties.ends;
            thingToPrepend = 'Ends: ';
        } else {
            alertExpiresTime = properties.expires;
            thingToPrepend = 'Expires: ';
        }
        var expiresTime = DateTime.fromISO(alertExpiresTime).toUTC().toJSDate();
        var currentTime = DateTime.now().toUTC().toJSDate();
        const dateDiff = ut.getDateDiff(currentTime, expiresTime);
        var formattedDateDiff;
        var thingToAppend = '';
        var textColor = 'white';
        var isNegative = dateDiff.negative;
        if (dateDiff.s) { formattedDateDiff = `${dateDiff.s}s`; }
        if (dateDiff.m) { formattedDateDiff = `${dateDiff.m}m ${dateDiff.s}s`; }
        if (dateDiff.h) { formattedDateDiff = `${dateDiff.h}h ${dateDiff.m}m`; }
        if (dateDiff.d) { formattedDateDiff = `${dateDiff.d}d ${dateDiff.h}h`; }
        if (isNegative) { thingToAppend = ' ago'; textColor = 'rgba(229, 78, 78, 1)'; }
        if (amountOfParams != 0) { popupItem += break_small }
        popupItem += `<b style="color: ${textColor}"><b>${thingToPrepend}</b><b class="alertsMonospaceText"> ${formattedDateDiff}${thingToAppend}</b></b></div></div>`;

        if (parseInt(key) + 1 < e.features.length) {
            popupItem += break_large;
        } else {
            popupItem += break_small;
        }

        function checkPropertyExists(property) {
            var isUndefined = typeof property == 'undefined';
            if (isUndefined) {
                return 'None';
            } else {
                return property;
            }
        }
        var extentedAlertDescription = 
`<div style="white-space: pre-wrap;"><b><span style="display: block; margin-bottom: 1em;"></span>${checkPropertyExists(properties.event)}
<hr>${checkPropertyExists(properties.senderName)}</b>
<hr>${checkPropertyExists(properties.headline)}
<hr><b class="alertTextDescriber">Sent:</b><br>${ut.printFancyTime(new Date(properties.sent))}
<br><b class="alertTextDescriber">WMO Identifier:</b><br>${checkPropertyExists(parameters.WMOidentifier)}
<b class="alertTextDescriber">VTEC:</b><br>${checkPropertyExists(parameters.VTEC)}
<br><b class="alertTextDescriber">NWS Headline:</b><br>${checkPropertyExists(parameters.NWSheadline)}
<br><b class="alertTextDescriber">Description:</b><br>${checkPropertyExists(properties.description)}
<br><b class="alertTextDescriber">Instructions:</b><br>${checkPropertyExists(properties.instruction)}</div>
<br><b class="alertTextDescriber">Areas affected:</b><br><i>${checkPropertyExists(properties.areaDesc)}</i>`
        alertContentObj[id] = {
            'title': `${properties.event}`,
            'body': extentedAlertDescription,
            'color': initColor,
            'textColor': chroma(initColor).luminance() > 0.4 ? 'black' : 'white'
        };

        //popupItem += '<br>';
    }
    }
    const popup = new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
        .setLngLat(e.lngLat)
        .setHTML(popupItem)
        .addTo(map);

    $('.extraAlertTextTrigger').on('click', function(e) {
        var id = $(this).attr('id');
        // ut.spawnModal({
        //     'title': alertContentObj[id].title,
        //     'headerColor': 'alert-success',
        //     'css': 'height: 50vh; overflow: scroll',
        //     'body': alertContentObj[id].body
        // })
        // console.log(alertContentObj[id])
        display_attic_dialog({
            'title': alertContentObj[id].title,
            'body': alertContentObj[id].body,
            'color': alertContentObj[id].color,
            'textColor': alertContentObj[id].textColor,
        })
    })
}

module.exports = click_listener;