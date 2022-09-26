var map = require('../radar/map/map');
const ut = require('../radar/utils');
const getPolygonColors = require('./polygonColors');

function updateAccordion(number, title, expanded, body, color) {
    var content = 
    `<div class="accordion-item">
        <h2 class="accordion-header" id="accordionHeader${number}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionContent${number}"
                aria-expanded="${expanded}" aria-controls="collapseOne" style="background-color: ${color}">
                ${title}
            </button>
        </h2>
        <div id="accordionContent${number}" class="accordion-collapse collapse" aria-labelledby="accordionHeader${number}"
            data-bs-parent="#alertModalAccordion">
            <div class="accordion-body alertAccordionBody">${body}</div>
        </div>
    </div>`

    if (parseInt(number) == 0) {
        document.getElementById('alertModalAccordion').innerHTML = '';
    }
    document.getElementById('alertModalAccordion').innerHTML += content;
}

function rgbToRGBA(rgb, opacity) {
    var str = rgb.slice(0, -1)
    str += `, ${opacity})`;
    str = str.slice(3);
    str = 'rgba' + str;
    return str;
}

function addMarker(e) {
    for (key in e.features) {
        var properties = e.features[key].properties;
        var parameters = JSON.parse(properties.parameters);

        var alertURL = properties['@id'];

        var alertModalBody = 
            `<b>${properties.event}
            <br>${properties.senderName}
            <br>${properties.headline}</b>
            <br><u>${ut.printFancyTime(new Date(properties.sent))}</u>
            <br><u>${parameters.WMOidentifier}</u>
            <br><u>${parameters.VTEC}</u>
            <br><u>${properties.areaDesc}</u>
            <br>${parameters.NWSheadline}
            <br>${properties.description}
            <br>${properties.instruction}`
        //document.getElementById('alertModalBody').innerHTML = alertModalBody;
        //var alertTitle = `Alert #${parseInt(key) + 1}`;
        var alertTitle = properties.event;

        var color = getPolygonColors(properties.event);
        updateAccordion(key, alertTitle, false, alertModalBody, rgbToRGBA(color, 0.5));
    }

    // open the modal
    $('#alertModalTrigger').click();



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