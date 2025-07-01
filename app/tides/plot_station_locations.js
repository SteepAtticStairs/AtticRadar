const map = require('../core/map/map');
const turf = require('@turf/turf');

const get_individual_data = require('./get_individual_data');
const show_chart = require('./show_chart');
const display_attic_dialog = require('../core/menu/attic_dialog');
const set_layer_order = require('../core/map/setLayerOrder');

function _click_listener(e) {
    // copy coordinates array
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;
    const alt_name = e.features[0].properties.station_alt_name;
    const id = e.features[0].properties.station_id;

    display_attic_dialog({
        'title': 'Tide Station',

        'body':
`<div id="tide_chart_container">
    <div class="tide_chart_container_text">Loading...</div>
</div>\
<div id="tide_station_footer">\
<div id="tide_stations_datepicker_container"><div id="tide_stations_datepicker"></div></div>\
<div id="tide_height_text"></div>\
</div>`,

        'color': 'rgb(120, 120, 120)',
        'textColor': 'black',
    })

    const today = new Date();
    get_individual_data(id, alt_name, today, (tide_height_array, station_name) => {
        show_chart(tide_height_array, station_name, id, today);
    })
    // new mapboxgl.Popup({ className: 'alertPopup' })
    //     .setLngLat(coordinates)
    //     .setHTML(description)
    //     .addTo(map);
    // fetchData(id, function(tideHeightArr) {
    //     drawChart(divName, tideHeightArr);
    // })
}

function plot_station_locations(json) {
    const points = [];
    for (var i = 0; i < json.stations.length; i++) {
        const lat = json.stations[i].lat;
        const lng = json.stations[i].lng;
        const name = json.stations[i].name;
        const alt_name = json.stations[i].alt_name;
        const id = json.stations[i].id;

        const popup_html = `
<div style="text-align: center">
    <div><b>${name}</b></div>
    <div>${id}</div>
</div>`

        const point = turf.point([lng, lat], {
            'station_name': name,
            'station_alt_name': alt_name,
            'station_id': id,
            'description': popup_html
        });
        points.push(point);
    }

    const featureCollection = turf.featureCollection(points);
    map.addSource('tide_station_source', {
        'type': 'geojson',
        'data': featureCollection
    })
    map.addLayer({
        id: 'tide_station_layer',
        type: 'circle',
        source: 'tide_station_source',
        'paint': {
            'circle-radius': 4,
            'circle-stroke-width': 3,
            'circle-color': '#4287f5',
            'circle-stroke-color': '#002b70',
        }
    })

    map.on('mouseenter', 'tide_station_layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'tide_station_layer', () => {
        map.getCanvas().style.cursor = '';
    });
    map.on('click', 'tide_station_layer', _click_listener);

    set_layer_order();
}

module.exports = plot_station_locations;