const ut = require('../../core/utils');
const kmz_to_geojson = require('../../hurricanes/kmz_to_geojson');
const get_polygon_colors = require('../colors/polygon_colors');
const turf = require('@turf/turf');
const map = require('../../core/map/map');
const set_layer_order = require('../../core/map/setLayerOrder');
const AtticPopup = require('../../core/popup/AtticPopup');

const all_watches_url = ut.phpProxy + `https://www.spc.noaa.gov/products/watch/ActiveWW.kmz`; // https://www.spc.noaa.gov/products/watch/ActiveWW.kmz

function click_listener(e) {
    const popup = new AtticPopup(e.lngLat, `<b><div>${e.features[0].properties.event}</div></b>`);
    popup.add_to_map();
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
            const first_watch_url = parsed_xml.kml.Folder.NetworkLink.Link.href['#text'];
            const first_watch_desc = parsed_xml.kml.Folder.NetworkLink.name['#text'];
            const event = /(.*? Watch \d+).*/.exec(first_watch_desc)[1];
            const color = get_polygon_colors(event.substring(0, event.lastIndexOf(' '))).color;

            var id_split = event.split(' ');
            const id = id_split[id_split.length - 1];

            _fetch_individual_watch(first_watch_url, (geojson) => {
                geojson.features[0].properties.event = event;
                geojson.features[0].properties.color = color;
                geojson.features[0].properties.id = id;
                features.push(geojson.features[0]);

                _plot_watches(turf.featureCollection(features));
            })
        }, true);
    })
}

module.exports = fetch_watches;