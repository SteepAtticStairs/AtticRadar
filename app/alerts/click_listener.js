var map = require('../core/map/map');
const AtticPopup = require('../core/popup/AtticPopup');
const hash_string = require('./hash_string');
const get_polygon_colors = require('./colors/polygon_colors');
const display_attic_dialog = require('../core/menu/attic_dialog');
const ut = require('../core/utils');
const chroma = require('chroma-js').default;
const { DateTime } = require('luxon');

// https://stackoverflow.com/a/4878800/18758797
function to_title_case(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

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

function check_property_exists(property) {
    var is_undefined = typeof property == 'undefined';
    if (is_undefined) {
        return 'None';
    } else {
        return property;
    }
}

function click_listener(e) {
    e.originalEvent.cancelBubble = true;

    const rendered_features = map.queryRenderedFeatures(e.point);

    const alert_content_obj = {};
    const already_added_alerts = [];
    const popup_htmls = [];
    for (var i = 0; i < e.features.length; i++) {
        var properties = e.features[i].properties;
        var parameters = JSON.parse(properties.parameters);

        // some alerts are duplicates, this filters out ones already seen
        const hash = hash_string(JSON.stringify(properties?.['@id']));
        if (!already_added_alerts.includes(hash)) {
            already_added_alerts.push(hash);

            var id = `${hash}alert`;
            var init_color = get_polygon_colors(properties.event).color;
            var background_color = init_color;
            var border_color = chroma(init_color).darken(1.5);
            var text_color = chroma(init_color).luminance() > 0.4 ? 'black' : 'white';

            var parameters_html = '';
            // parameters are the little info lines on the map popup,
            // we're just building a big html block here
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

            var alert_expires_time;
            var thing_to_prepend = 'Expires:';
            if (properties.hasOwnProperty('ends')) {
                alert_expires_time = properties.ends;
            } else {
                alert_expires_time = properties.expires;
            }
            var expires_time = DateTime.fromISO(alert_expires_time).toUTC().toJSDate();
            var current_time = DateTime.now().toUTC().toJSDate();
            const date_diff = ut.getDateDiff(current_time, expires_time);
            var formatted_date_diff;
            var thing_to_append = '';
            var text_color = ''; // white
            var is_negative = date_diff.negative;
            if (date_diff.s) { formatted_date_diff = `${date_diff.s}s`; }
            if (date_diff.m) { formatted_date_diff = `${date_diff.m}m ${date_diff.s}s`; }
            if (date_diff.h) { formatted_date_diff = `${date_diff.h}h ${date_diff.m}m`; }
            if (date_diff.d) { formatted_date_diff = `${date_diff.d}d ${date_diff.h}h`; }
            if (is_negative) { thing_to_prepend = 'Expired:'; thing_to_append = ' ago'; text_color = 'rgba(229, 78, 78, 1)'; }

            // there are 2 types of headlines for some reason
            var NWS_headline = check_property_exists(parameters.NWSheadline); // usually capitalized
            var other_headline = check_property_exists(properties.headline); // usually a rewording of the basic alert info
            // we can switch the secondary headline into the main slot just in case
            if (NWS_headline == 'None') {
                var temp = other_headline;
                other_headline = NWS_headline;
                NWS_headline = temp;
            }

            var popup_html =
`<div style="font-weight: bold; font-size: 13px;">${properties.event}</div>
<div><span class="alert_popup_lessertext">${thing_to_prepend}</span> ${formatted_date_diff} ${thing_to_append}</div>
${parameters_html}\
<i id="${id}" class="alert_popup_info icon-blue fa fa-circle-info" style="color: rgb(255, 255, 255);"></i>`;

            // add to the array of future scrollable alerts on the popup
            popup_htmls.push(popup_html);

            // this goes on the dialog when the info button is pressed
            var extented_alert_description = 
`<div style="white-space: pre-wrap; color: rgb(200, 200, 200);"><b style="color: ${init_color} !important;"><span style="display: block; margin-bottom: 1em;"></span>${check_property_exists(properties.event)}</b>
${check_property_exists(properties.senderName)}
<hr>${NWS_headline}
<hr><b class="alertTextDescriber">Sent:</b><br>${ut.printFancyTime(new Date(properties.sent))}
<br><b class="alertTextDescriber">Description:</b><br>${check_property_exists(properties.description)}
<br><b class="alertTextDescriber">Instructions:</b><br>${check_property_exists(properties.instruction)}
<br><b class="alertTextDescriber">Areas affected:</b><br><i>${check_property_exists(properties.areaDesc)}</i>
<br><b class="alertTextDescriber">WMO Identifier:</b><br>${check_property_exists(parameters.WMOidentifier)}
<b class="alertTextDescriber">VTEC:</b><br>${check_property_exists(parameters.VTEC)}</div>`

            // store specific dialog information for later (click events)
            alert_content_obj[id] = {
                'title': `${properties.event}`,
                'body': extented_alert_description,
                'color': init_color,
                'textColor': chroma(init_color).luminance() > 0.4 ? 'black' : 'white'
            };
        }
    }

    // we need to determine the widest element in popup_htmls so that the map popup is that wide, no bigger
    // this creates a fake hidden element to measure them 
    const measure_container = $('<div></div>').css({
        position: 'absolute',
        visibility: 'hidden',
        height: 'auto',
        width: 'auto',
        whiteSpace: 'nowrap',
        overflow: 'visible',
        pointerEvents: 'none',
        top: '-9999px',
        left: '-9999px'
    }).appendTo('body');

    var max_width = 0;

    popup_htmls.forEach(html => {
        const temp_div = $('<div></div>').html(html).appendTo(measure_container);
        const width = temp_div.outerWidth(true);
        if (width > max_width) {
            max_width = width;
        }
        temp_div.remove();
    })

    measure_container.remove();

    // set up the scrollable div
    var swiper_div = `<div class="swiper mySwiper"><div class="swiper-wrapper">`;
    var swiper_div_end = `</div><div class="swiper-pagination"></div></div>`;
    for (var i = 0; i < popup_htmls.length; i++) {
        var content = `<div class="swiper-slide">${popup_htmls[i]}</div>`;
        swiper_div += content;
    }
    swiper_div += swiper_div_end;

    const popup = new AtticPopup(e.lngLat, swiper_div);
    popup.add_to_map();
    // not sure why this works but it does
    if (popup_htmls.length > 1) {
        popup.attic_popup_div.width(max_width);

        // need to fix padding issues with the dots at the bottom
        $('.attic_popup').css('padding-bottom', 0);
    }
    // make sure the blue info button has enough space
    popup.attic_popup_div.width(`+=${$('.alert_popup_info').outerWidth() + parseInt($('.alert_popup_info').css('paddingRight')) * 2}`);

    new Swiper(".mySwiper", {
        pagination: {
            el: ".swiper-pagination",
            clickable: true, // makes the dots clickable
        },
        mousewheel: {
            forceToAxis: false, // you can scroll vertically or horizontally to change slides
            sensitivity: 1,
        },
    });
    popup.update_popup_pos();

    // click listener for the blue info button
    $('.alert_popup_info').on('click', function(e) {
        var id = $(this).attr('id');
        display_attic_dialog({
            'title': alert_content_obj[id].title,
            'body': alert_content_obj[id].body,
            'color': alert_content_obj[id].color,
            'textColor': alert_content_obj[id].textColor,
        })
    })
}

module.exports = click_listener;