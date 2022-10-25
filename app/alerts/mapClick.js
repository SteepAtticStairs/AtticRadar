var map = require('../radar/map/map');
const ut = require('../radar/utils');
const getPolygonColors = require('./polygonColors');
const chroma = require('chroma-js')
const { DateTime } = require('luxon');

$('#alertsDialog').on('click', function() {
    $(this).hide();
})

function displayAlertDialog(options) {
    var title = options.title;
    var body = options.body;
    var color = options.color;
    var textColor = options.textColor;

    $('#alertsDialog').show();

    $('#alertsDialogHeader').html(title)
    $('#alertsDialogHeader').css('background-color', color);
    $('#alertsDialogHeader').css('color', textColor);

    $('#alertsDialogBody').scrollTop(0);
    $('#alertsDialogBody').html(body);
}

function rgbToRGBA(rgb, opacity) {
    var str = rgb.slice(0, -1)
    str += `, ${opacity})`;
    str = str.slice(3);
    str = 'rgba' + str;
    return str;
}

function addMarker(e) {
    var popupItem = '';
    var alertContentObj = {};
    for (key in e.features) {
        var id = `${Date.now()}alert`;
        var properties = e.features[key].properties;
        var parameters = JSON.parse(properties.parameters);
        //console.log(e.features[key])
        console.log(properties)

        var initColor = getPolygonColors(properties.event);
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
        var preStart = '<p style="line-height: 130%; margin-bottom: 0 !important">';
        var lineBreak = `<br>${preStart}`;
        var amountOfParams = 0;
        function addParameter(parameterName, textValueID) {
            if (parameters.hasOwnProperty(parameterName)) {
                if (amountOfParams == 0) { popupItem += lineBreak; }
                if (lineSpace == '' && amountOfParams != 0) { lineSpace = '&nbsp;&nbsp;&nbsp;'; }
                popupItem += `${lineSpace}<b>${textValueID}</b><b class="code" style="color: rgb(179, 143, 52)"> ${parameters[parameterName]}</b>`;
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
        if (amountOfParams != 0) { popupItem += '<br>' }
        popupItem += `<b style="color: ${textColor}"><b>${thingToPrepend}</b><b class="code"> ${formattedDateDiff}${thingToAppend}</b></b></p></div>`;

        var extentedAlertDescription = 
            `<div style="white-space: pre-wrap;"><b>${properties.event}
            <br>${properties.senderName}
            <br>${properties.headline}</b>
            <br><u>${ut.printFancyTime(new Date(properties.sent))}</u>
            <br><u>${parameters.WMOidentifier}</u>
            <br><u>${parameters.VTEC}</u>
            <br><u>${properties.areaDesc}</u>
            <br>${parameters.NWSheadline}
            <br>${properties.description}
            <br>${properties.instruction}</div>`
        alertContentObj[id] = {
            'title': `${properties.event}`,
            'body': extentedAlertDescription,
            'color': initColor,
            'textColor': chroma(initColor).luminance() > 0.4 ? 'black' : 'white'
        };

        //popupItem += '<br>';
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
        console.log(alertContentObj[id])
        displayAlertDialog({
            'title': alertContentObj[id].title,
            'body': alertContentObj[id].body,
            'color': alertContentObj[id].color,
            'textColor': alertContentObj[id].textColor,
        })
    })
    // for (key in e.features) {
    //     var properties = e.features[key].properties;
    //     var parameters = JSON.parse(properties.parameters);
    //     console.log(parameters)

    //     var alertURL = properties['@id'];

    //     var alertModalBody = 
    //         `<b>${properties.event}
    //         <br>${properties.senderName}
    //         <br>${properties.headline}</b>
    //         <br><u>${ut.printFancyTime(new Date(properties.sent))}</u>
    //         <br><u>${parameters.WMOidentifier}</u>
    //         <br><u>${parameters.VTEC}</u>
    //         <br><u>${properties.areaDesc}</u>
    //         <br>${parameters.NWSheadline}
    //         <br>${properties.description}
    //         <br>${properties.instruction}`
    //     //document.getElementById('alertModalBody').innerHTML = alertModalBody;
    //     //var alertTitle = `Alert #${parseInt(key) + 1}`;
    //     var color = getPolygonColors(properties.event);
    //     var alertTitle = 
    //         `<div style="color: white"><b style="color: ${color};">${properties.event}</b>`;

    //     var lineSpace = '';
    //     var lineBreak = `<br>`;
    //     var amountOfParams = 0;
    //     if (parameters.hasOwnProperty('maxHailSize')) {
    //         if (amountOfParams == 0) { alertTitle += lineBreak; }
    //         if (lineSpace == '' && amountOfParams != 0) { lineSpace = '&nbsp;&nbsp;&nbsp;'; }
    //         alertTitle += `${lineSpace}<b>Hail:</b> ${parameters.maxHailSize}`;
    //         amountOfParams++;
    //     }
    //     if (parameters.hasOwnProperty('maxWindGust')) {
    //         if (amountOfParams == 0) { alertTitle += lineBreak; }
    //         if (lineSpace == '' && amountOfParams != 0) { lineSpace = '&nbsp;&nbsp;&nbsp;'; }
    //         alertTitle += `${lineSpace}<b>Wind:</b> ${parameters.maxWindGust}</div>`;
    //         amountOfParams++;
    //     }
    //     alertTitle += '</div>'

    //     const popup = new mapboxgl.Popup({ className: 'alertPopup' })
    //         .setLngLat(e.lngLat)
    //         .setHTML(alertTitle)
    //         .addTo(map);
    //     //var color = getPolygonColors(properties.event);
    //     //updateAccordion(key, alertTitle, false, alertModalBody, rgbToRGBA(color, 0.5));
    // }

    // open the modal
    //$('#alertModalTrigger').click();



    // var pointURL = `https://api.weather.gov/alerts?active=1&point=${e.lngLat.lat},${e.lngLat.lng}`
    // console.log(pointURL)
    // var alertPopupContent = `<div><b>No Alerts</b></div>`
    // $.getJSON(pointURL, function(data) {
    //     if (data.features.length != 0) {
    //         alertPopupContent = '<div id="mainPopupDiv" style="overflow-y: scroll; max-height: 150px;">';
    //         for (var n = 0; n < data.features.length; n++) {
    //             var properties = data.features[n].properties

    //             var alertEvent = properties.event;
    //             var alertSenderName = properties.senderName;
    //             var alertHeadline = properties.headline;
    //             var alertDescription = properties.description;
    //             var alertInstruction = properties.instruction;

    //             var alertID = properties.id;
    //             var alertWMOidenifier = properties.parameters.WMOidentifier[0];
    //             var alertVTEC = "No VTEC for this alert."
    //             var alertNWSheadline = "No headline for this alert."

    //             if (alertInstruction == null) {
    //                 alertInstruction = "No instruction for this alert."
    //             }

    //             if (properties.parameters.hasOwnProperty('NWSheadline')) {
    //                 alertNWSheadline = properties.parameters.NWSheadline;
    //             }
    //             if (properties.parameters.hasOwnProperty('VTEC')) {
    //                 alertVTEC = properties.parameters.VTEC[0];
    //             }

    //             var alertSeverity = properties.severity;
    //             var alertUrgency = properties.urgency;

    //             var alertSentTime = new Date(properties.sent);
    //             var alertEffectiveTime = new Date(properties.effective);
    //             var alertOnsetTime = new Date(properties.onset);
    //             var alertExpiresTime = new Date(properties.expires);
    //             var alertEndsTime = new Date(properties.ends);
    //             alertPopupContent += `
    //             <div class='ughh' id='headlineExpander${n}' style='cursor: pointer'>
    //                 <b>${alertEvent}<br>${alertSenderName}</b>
    //             </div>
    //             <div id='alertBody${n}' style='display: none'>
    //                 <br><b>Send Time: </b>${ut.printFancyTime(alertSentTime)}
    //                 <br><b>Effective Time: </b>${ut.printFancyTime(alertEffectiveTime)}
    //                 <br><b>Onset Time: </b>${ut.printFancyTime(alertOnsetTime)}
    //                 <br><b>Expires Time: </b>${ut.printFancyTime(alertExpiresTime)}
    //                 <br><b>Ends Time: </b>${ut.printFancyTime(alertEndsTime)}
    //                 <br><br><b><i>${alertSeverity}</i></b>, <b><i>${alertUrgency}</i></b><br><br>
    //                 <b>WMO Identifier:</b> ${alertWMOidenifier}<br>
    //                 <b>VTEC:</b> ${alertVTEC}<br>
    //                 <b>NWS Headline:</b> ${alertNWSheadline}<br>
    //                 <b>ID:</b><div id='alertNameDiv'>${alertID}</div><br><br>
    //                 <b>Headline:</b> ${alertHeadline}<br>
    //                 <b>Description:</b> ${alertDescription}<br>
    //                 <b>Instructions:</b> ${alertInstruction}
    //             </div>`;
    //             if (n != data.features.length - 1) {
    //                 alertPopupContent += '<br>'
    //             }
    //         }
    //         alertPopupContent += '</div>'
    //     }

    //     var thepop = new mapboxgl.Popup()
    //         .setLngLat([e.lngLat.lng, e.lngLat.lat])
    //         .setHTML(alertPopupContent)
    //         .addTo(map);
    //     document.getElementById('mainPopupDiv').style.height = 'auto';

    //     function toggleDisplay(theelem) {
    //         if (document.getElementById(theelem).style.display == 'none') {
    //             document.getElementById(theelem).style.display = 'block'
    //             document.getElementById('mainPopupDiv').style.height = '150px';
    //         } else if (document.getElementById(theelem).style.display == 'block') {
    //             document.getElementById(theelem).style.display = 'none'
    //             document.getElementById('mainPopupDiv').style.height = 'auto';
    //         }
    //     }

    //     function addAlertListner(numbe) {
    //         document.getElementById('headlineExpander' + numbe).addEventListener('click', function() {
    //             toggleDisplay('alertBody' + numbe)
    //         })
    //     }

    //     var allHeadlines = document.getElementsByClassName('ughh')
    //     for (var f = 0; f < allHeadlines.length; f++) {
    //         addAlertListner(f)
    //     }
    // })
}

module.exports = addMarker;