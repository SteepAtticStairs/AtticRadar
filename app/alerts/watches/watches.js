const ut = require('../../core/utils');
const kmz_to_geojson = require('../../hurricanes/kmz_to_geojson');
const get_polygon_colors = require('../colors/polygon_colors');
const turf = require('@turf/turf');
const map = require('../../core/map/map');
const set_layer_order = require('../../core/map/setLayerOrder');
const AtticPopup = require('../../core/popup/AtticPopup');
const display_attic_dialog = require('../../core/menu/attic_dialog');

const all_watches_url = `https://www.spc.noaa.gov/products/watch/ActiveWW.kmz`; // https://www.spc.noaa.gov/products/watch/ActiveWW.kmz

function click_listener(e) {
    // if (e.originalEvent.cancelBubble) { return; }
    // const popup = new AtticPopup(e.lngLat, `<b><div>${e.features[0].properties.event}</div></b>`);
    // popup.add_to_map();

    if (e.originalEvent.cancelBubble) { return; }
    const renderedFeatures = map.queryRenderedFeatures(e.point);
    if (renderedFeatures[0] && renderedFeatures[0].layer.id == 'stationSymbolLayer') return;
    const properties = e.features[0].properties;
    const divid = `ww${properties.id}`

    var popup_html =
`<div style="font-weight: bold; font-size: 13px;">${properties.event}</div>
<i id="${divid}" class="alert_popup_info icon-blue fa fa-circle-info" style="color: rgb(255, 255, 255);"></i>`;

    const popup = new AtticPopup(e.lngLat, popup_html);
    popup.add_to_map();
    popup.attic_popup_div.width(`+=${$('.alert_popup_info').outerWidth() + parseInt($('.alert_popup_info').css('paddingRight'))}`);
    popup.update_popup_pos();

    $(`#${divid}`).on('click', function() {
        display_attic_dialog({
            'title': `${properties.event}`,
            'body': properties.full_desc,
            'color': properties.color,
            'textColor': 'white',
        })
    })
}

function _fetch_individual_watch(url, callback) {
    fetch(ut.phpProxy + url, { cache: 'no-store' })
    .then(response => response.blob())
    .then(blob => {
        blob.lastModifiedDate = new Date();
        blob.name = url;

        kmz_to_geojson(blob, (geojson) => {
            callback(geojson);
        });
    })
}

function _plot_watches(feature_collection) {
    var duplicate_features = feature_collection.features.flatMap((element) => [element, element]);
    duplicate_features = JSON.parse(JSON.stringify(duplicate_features));
    for (var i = 0; i < duplicate_features.length; i++) {
        if (i % 2 === 0) {
            duplicate_features[i].properties.type = 'border';
        } else {
            duplicate_features[i].properties.type = 'outline';
        }
    }
    feature_collection.features = duplicate_features;

    if (map.getSource('watches_source')) {
        map.getSource('watches_source').setData(feature_collection);
    } else {
        map.addSource(`watches_source`, {
            type: 'geojson',
            data: feature_collection,
        })
        map.addLayer({
            'id': `watches_layer`,
            'type': 'line',
            'source': `watches_source`,
            'paint': {
                'line-color': [
                    'case',
                    ['==', ['get', 'type'], 'outline'],
                    ['get', 'color'],
                    ['==', ['get', 'type'], 'border'],
                    'black',
                    'rgba(0, 0, 0, 0)'
                ],
                'line-width': [
                    'case',
                    ['==', ['get', 'type'], 'outline'],
                    3,
                    ['==', ['get', 'type'], 'border'],
                    7,
                    0
                ]
            }
        });
        map.addLayer({
            'id': `watches_layer_fill`,
            'type': 'fill',
            'source': `watches_source`,
            paint: {
                //#0080ff blue
                //#ff7d7d red
                'fill-color': ['get', 'color'],
                'fill-opacity': 0
            }
        });

        map.on('mouseover', `watches_layer_fill`, function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseout', `watches_layer_fill`, function(e) {
            map.getCanvas().style.cursor = '';
        });
        map.on('click', `watches_layer_fill`, click_listener);

        set_layer_order();
    }
}

const features = [];
function fetch_watches() {
    fetch(/*ut.phpProxy + */all_watches_url, { cache: 'no-store' })
    .then(response => response.blob())
    .then(blob => {
        blob.lastModifiedDate = new Date();
        blob.name = all_watches_url;

        kmz_to_geojson(blob, (kml_dom) => {
            const parsed_xml = ut.xmlToJson(kml_dom);
            const base = parsed_xml.kml.Folder.NetworkLink;
            if (!base) { return; }
            for (var i = 0; i < base.length; i++) {
                const this_discussion_url = base[i].Link.href['#text'];
                const this_discussion_desc = base[i].name['#text'];
                const event = /(.*? Watch \d+).*/.exec(this_discussion_desc)[1];
                const color = get_polygon_colors(event.substring(0, event.lastIndexOf(' '))).color;

                var id_split = event.split(' ');
                const id = id_split[id_split.length - 1];

                _fetch_individual_watch(this_discussion_url, (geojson) => {
                    geojson.features[0].properties.event = event;
                    geojson.features[0].properties.color = color;
                    geojson.features[0].properties.id = id;
                    // features.push(geojson.features[0]);

                    fetch(ut.phpProxy + `https://www.spc.noaa.gov/products/watch/ww${id.padStart(4, '0')}.html`)
                    .then(response => response.text())
                    .then(text => {
                        const doc = new DOMParser().parseFromString(text, 'text/html');
                        const full_desc = doc.querySelectorAll('pre')[0].innerHTML;
                        geojson.features[0].properties.full_desc = full_desc;
                        // console.log($('pre', $( '<div></div>' ).html(text)).text())

                        features.push(geojson.features[0]);
                        console.log(geojson.features[0]);
                        _plot_watches(turf.featureCollection(features));
                    })
                })
            }
        }, true);
    })
}

module.exports = fetch_watches;