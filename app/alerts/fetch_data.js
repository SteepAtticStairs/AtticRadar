const ut = require('../core/utils');
const plot_alerts = require('./plot_alerts');
const pako = require('pako');
const geojsonMerge = require('@mapbox/geojson-merge');

const url_prefix = 'https://steepatticstairs.net/AtticRadar/';

const new_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getShortFusedHazards.php?all=true`;
const sws_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getSps.php`;
// https://realearth.ssec.wisc.edu/products/?app=_ALL_
const all_alerts_url = `https://realearth.ssec.wisc.edu/api/shapes?products=NWS-Alerts-All`;
const noaa_alerts_url = `https://api.weather.gov/alerts/active`;

// previously, these were written as:
// "../app/alerts/zones/forecast_zones.js.gz"
// but that didn't work when pushed to github pages
const zone_urls = [
    `${url_prefix}app/alerts/zones/forecast_zones.js.gz`,
    `${url_prefix}app/alerts/zones/county_zones.js.gz`,
    `${url_prefix}app/alerts/zones/fire_zones.js.gz`,
];

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

function _fetch_alerts_data(callback) {
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then(response => response.json())
    .then(alerts_data => {
        plot_alerts(alerts_data, callback);
    })
}

function _fetch_zone_dictionaries(callback, index = 0) {
    fetch(zone_urls[index])
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const inflated = pako.inflate(buffer, { to: 'string' });

        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = inflated;
        document.head.appendChild(s);

        if (index < zone_urls.length - 1) {
            _fetch_zone_dictionaries(callback, index + 1);
        } else {
            callback();
        }
    })
}

function _fetch_data() {
    if (window.loaded_zones == undefined || window.loaded_zones == false) {
        window.loaded_zones = true;

        _fetch_alerts_data((alerts_data) => {
            _fetch_zone_dictionaries(() => {
                const merged_geoJSON = _combine_dictionary_data(alerts_data);
                map.getSource('alertsSource').setData(merged_geoJSON);
            });
        })
    } else {
        _fetch_alerts_data();
    }
}

function _combine_dictionary_data(alerts_data) {
    var polygonGeojson = {
        "type": "FeatureCollection",
        "features": []
    }
    function pushNewPolygon(geometry, properties) {
        // this allows you to add properties for each cell
        var objToPush = {
            "type": "Feature",
            "geometry": geometry,
            "properties": properties
        }
        polygonGeojson.features.push(objToPush)
    }
    for (var item in alerts_data.features) {
        if (alerts_data.features[item].geometry == null) {
            var affectedZones = alerts_data.features[item].properties.affectedZones;
            for (var i in affectedZones) {
                var zoneToPush;
                if (affectedZones[i].includes('forecast')) {
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/forecast/', '');
                    zoneToPush = forecast_zones[affectedZones[i]];
                } else if (affectedZones[i].includes('county')) {
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/county/', '');
                    zoneToPush = county_zones[affectedZones[i]];
                } else if (affectedZones[i].includes('fire')) {
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/fire/', '');
                    zoneToPush = fire_zones[affectedZones[i]];
                }
                if (zoneToPush != undefined) {
                    pushNewPolygon(zoneToPush.geometry, alerts_data.features[item].properties);
                }
            }
        }
    }
    var merged_geoJSON = geojsonMerge.merge([
        polygonGeojson,
        alerts_data
    ]);
    return merged_geoJSON;
}

module.exports = {
    _fetch_data
}