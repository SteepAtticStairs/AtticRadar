var map = require('../core/map/map');
const ut = require('../core/utils');
const get_polygon_colors = require('./colors/polygon_colors');
const display_attic_dialog = require('../core/menu/attic_dialog');
const chroma = require('chroma-js')
const { DateTime } = require('luxon');
const hash_string = require('./hash_string');
const AtticPopup = require('../core/popup/AtticPopup');

// https://www.geeksforgeeks.org/how-to-change-the-height-of-br-tag
const break_small = `<span style="display: block; margin-bottom: -.4em;"></span>`;
const break_large = `<span style="display: block; margin-bottom: 0.75em;"></span>`;

// https://stackoverflow.com/a/4878800/18758797
function to_title_case(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function click_listener(e) {
    e.originalEvent.cancelBubble = true;

    var alertContentObj = {};
    var alreadyAddedAlerts = [];
    for (var key = 0; key < 1; key++) { // for (key in e.features) {
        var properties = e.features[key].properties;
        var parameters = JSON.parse(properties.parameters);

        delete properties.type;
        const hash = hash_string(JSON.stringify(properties));
        if (!alreadyAddedAlerts.includes(hash)) {
            alreadyAddedAlerts.push(hash);

            console.log(parameters);

            var id = `${hash}alert`;
            var initColor = get_polygon_colors(properties.event).color;
            var backgroundColor = initColor;
            var borderColor = chroma(initColor).darken(1.5);
            var textColor = chroma(initColor).luminance() > 0.4 ? 'black' : 'white';

            function _fix_value(value, text_value_ID) {
                if (Array.isArray(value)) {
                    value = value[0];
                }
                // check if string is all uppercase and only contains letters & spaces
                // https://stackoverflow.com/a/12778207/18758797
                if (value === value.toUpperCase() && /^[a-zA-Z\s]*$/.test(value)) {
                    value = to_title_case(value);
                }
                value = value.replaceAll('MPH', 'mph');
                if (text_value_ID == 'Hail:') {
                    value += '"';
                }
                return value;
            }

            var parameters_html = '';
            function add_parameter(parameter_name, text_value_ID) {
                if (parameters.hasOwnProperty(parameter_name)) {
                    value = _fix_value(parameters[parameter_name], text_value_ID);

                    if (properties.event == 'Severe Thunderstorm Warning') {
                        if (parameter_name == 'maxHailSize' && parameters.hasOwnProperty('hailThreat')) {
                            value += `, ${_fix_value(parameters['hailThreat'])}`;
                        }
                        if (parameter_name == 'maxWindGust' && parameters.hasOwnProperty('windThreat')) {
                            value += `, ${_fix_value(parameters['windThreat'])}`;
                        }
                    }

                    parameters_html += `<div><span class="alert_popup_lessertext">${text_value_ID}</span> ${value}</div>`
                }
            }
            add_parameter('tornadoDetection', 'Tornado:');
            add_parameter('waterspoutDetection', 'Waterspout:');
            add_parameter('flashFloodDamageThreat', 'Damage Threat:');
            add_parameter('flashFloodDetection', 'Source:');
            add_parameter('maxHailSize', 'Hail:');
            add_parameter('maxWindGust', 'Wind:');

            var alertExpiresTime;
            var thingToPrepend = 'Expires:';
            if (properties.hasOwnProperty('ends')) {
                alertExpiresTime = properties.ends;
                // thingToPrepend = 'Ends: ';
            } else {
                alertExpiresTime = properties.expires;
                // thingToPrepend = 'Expires: ';
            }
            var expiresTime = DateTime.fromISO(alertExpiresTime).toUTC().toJSDate();
            var currentTime = DateTime.now().toUTC().toJSDate();
            const dateDiff = ut.getDateDiff(currentTime, expiresTime);
            var formattedDateDiff;
            var thingToAppend = '';
            var textColor = ''; // white
            var isNegative = dateDiff.negative;
            if (dateDiff.s) { formattedDateDiff = `${dateDiff.s}s`; }
            if (dateDiff.m) { formattedDateDiff = `${dateDiff.m}m ${dateDiff.s}s`; }
            if (dateDiff.h) { formattedDateDiff = `${dateDiff.h}h ${dateDiff.m}m`; }
            if (dateDiff.d) { formattedDateDiff = `${dateDiff.d}d ${dateDiff.h}h`; }
            if (isNegative) { thingToPrepend = 'Expired:'; thingToAppend = ' ago'; textColor = 'rgba(229, 78, 78, 1)'; }

            function checkPropertyExists(property) {
                var isUndefined = typeof property == 'undefined';
                if (isUndefined) {
                    return 'None';
                } else {
                    return property;
                }
            }

            var main_headline = checkPropertyExists(parameters.NWSheadline);
            var secondary_headline = checkPropertyExists(properties.headline);
            if (main_headline == 'None') {
                var temp = secondary_headline;
                secondary_headline = main_headline;
                main_headline = temp;
            }

            var popup_html =
`<div style="font-weight: bold; font-size: 13px;">${properties.event}</div>
<div><span class="alert_popup_lessertext">${thingToPrepend}</span> ${formattedDateDiff} ${thingToAppend}</div>
${parameters_html}
<i id="${id}" class="alert_popup_info icon-blue fa fa-circle-info" style="color: rgb(255, 255, 255);"></i>`;

            var extentedAlertDescription = 
`<div style="white-space: pre-wrap;"><b><span style="display: block; margin-bottom: 1em;"></span>${checkPropertyExists(properties.event)}
<hr>${checkPropertyExists(properties.senderName)}</b>
<hr>${secondary_headline}
<hr>${main_headline}
<hr><b class="alertTextDescriber">Sent:</b><br>${ut.printFancyTime(new Date(properties.sent))}
<br><b class="alertTextDescriber">WMO Identifier:</b><br>${checkPropertyExists(parameters.WMOidentifier)}
<b class="alertTextDescriber">VTEC:</b><br>${checkPropertyExists(parameters.VTEC)}
<br><b class="alertTextDescriber">Description:</b><br>${checkPropertyExists(properties.description)}
<br><b class="alertTextDescriber">Instructions:</b><br>${checkPropertyExists(properties.instruction)}
<br><b class="alertTextDescriber">Areas affected:</b><br><i>${checkPropertyExists(properties.areaDesc)}</i></div>`
            alertContentObj[id] = {
                'title': `${properties.event}`,
                'body': extentedAlertDescription,
                'color': initColor,
                'textColor': chroma(initColor).luminance() > 0.4 ? 'black' : 'white'
            };
        }
    }

    const popup = new AtticPopup(e.lngLat, popup_html);
    popup.add_to_map();
    popup.attic_popup_div.width(`+=${$('.alert_popup_info').outerWidth() + parseInt($('.alert_popup_info').css('paddingRight'))}`);
    popup.update_popup_pos();
    // const popup = new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
    //     .setLngLat(e.lngLat)
    //     .setHTML(popupItem)
    //     .addTo(map);

    $('.alert_popup_info').on('click', function(e) {
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