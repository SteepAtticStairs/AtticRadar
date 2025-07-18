var map = require('../core/map/map');
const AtticPopup = require('../core/popup/AtticPopup');
const hash_string = require('./hash_string');
const get_polygon_colors = require('./colors/polygon_colors');
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

    const popup_htmls = [];
    for (var i = 0; i < e.features.length; i++) {
        var properties = e.features[i].properties;
        var parameters = JSON.parse(properties.parameters);
        const hash = hash_string(JSON.stringify(properties));

        var id = `${hash}alert`;
        var init_color = get_polygon_colors(properties.event).color;
        var background_color = init_color;
        var border_color = chroma(init_color).darken(1.5);
        var text_color = chroma(init_color).luminance() > 0.4 ? 'black' : 'white';

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

        var main_headline = check_property_exists(parameters.NWSheadline);
        var secondary_headline = check_property_exists(properties.headline);
        if (main_headline == 'None') {
            var temp = secondary_headline;
            secondary_headline = main_headline;
            main_headline = temp;
        }

        var popup_html =
`<div style="font-weight: bold; font-size: 13px;">${properties.event}</div>
<div><span class="alert_popup_lessertext">${thing_to_prepend}</span> ${formatted_date_diff} ${thing_to_append}</div>
${parameters_html}\
<i id="${id}" class="alert_popup_info icon-blue fa fa-circle-info" style="color: rgb(255, 255, 255);"></i>`;
        popup_htmls.push(popup_html);
    }

    // create hidden container for measuring
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

    let max_width = 0;

    popup_htmls.forEach(html => {
        const temp_div = $('<div></div>').html(html).appendTo(measure_container);
        const width = temp_div.outerWidth(true);
        if (width > max_width) {
            max_width = width;
        }
        temp_div.remove();
    })

    measure_container.remove();

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
    popup.attic_popup_div.width(`+=${$('.alert_popup_info').outerWidth() + parseInt($('.alert_popup_info').css('paddingRight')) * 2}`);

    new Swiper(".mySwiper", {
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        mousewheel: {
            forceToAxis: false,
            sensitivity: 1,
        },
    });
    popup.update_popup_pos();
}

module.exports = click_listener;