const nexrad_locations = require('../../../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;
const turf = require('@turf/turf');
const ut = require('../../../../core/utils');
const setLayerOrder = require('../../../../core/map/setLayerOrder');
const icons = require('../../../../core/map/icons/icons');
const AtticPopup = require('../../../../core/popup/AtticPopup');

function findTerminalCoordinates(startLat, startLng, distanceNM, bearingDEG) {
    var metersInNauticalMiles = 1852;
    var distanceMeters = distanceNM * metersInNauticalMiles;
    var bearing = bearingDEG;

    var point = turf.point([startLng, startLat]);
    var destiation = turf.destination(point, distanceMeters, bearing, {units: 'meters'});
    return destiation;
}

function plot_tornado_vortex_signature(L3Factory) {
    icons.add_icon_svg([
        [icons.icons.tornado_icon, 'tornado']
    ], () => {
        const all_tracks = L3Factory.formatted_tabular.tvs;
        const station_info = nexrad_locations[L3Factory.station];

        function individual_cell(id) {
            const base_point = findTerminalCoordinates(station_info.lat, station_info.lon, all_tracks[id].range, all_tracks[id].az);
            const coords = {'lng': base_point.geometry.coordinates[0], 'lat': base_point.geometry.coordinates[1]};
            base_point.properties.cellProperties = all_tracks[id];
            base_point.properties.cellID = all_tracks[id].cell_id;
            base_point.properties.coords = coords;
            return base_point;
        }

        var storm_IDs = Object.keys(all_tracks);
        var multipoint_coords = [];
        for (var i in storm_IDs) {
            var ic_result = individual_cell(storm_IDs[i]);
            multipoint_coords.push(ic_result);
        }
        var multipoint_geoJSON = turf.featureCollection(multipoint_coords);

        var tvs_layers = [];
        tvs_layers.push('tvsInitialPoint');
        map.addLayer({
            id: 'tvsInitialPoint',
            type: 'symbol',
            source: {
                'type': 'geojson',
                'data': multipoint_geoJSON,
            },
            layout: {
                'icon-image': 'tornado_icon',
                'icon-size': 0.2,
                'text-allow-overlap': true,
                'text-ignore-placement': true,
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
            },
        })
        window.atticData.tvs_layers = tvs_layers;

        function cellClick(e) {
            // if (window.atticData.currentStation == L3Factory.station) {
                const properties = e.features[0].properties;
                const cellID = properties.cellID;
                const cellProperties = JSON.parse(properties.cellProperties);

                var fileTime = L3Factory.get_date();
                var hourMin = ut.printHourMin(fileTime, ut.userTimeZone);

                function flip(num) {
                    if (num >= 180) {
                        return num - 180;
                    } else if (num < 180) {
                        return num + 180;
                    }
                }

                var popupHTML =
    `<b><u>TVS</u></b>
    <div>Cell <b>${cellID}</b> at <b>${hourMin}</b></div>
    <div><b>${ut.degToCompass(flip(cellProperties.az))}</b> at <b>${ut.knotsToMph(cellProperties.range, 0)}</b> mph</div>
    <br>
    <div>Average Delta Velocity: <b>${cellProperties.avfdv} kts</b>
    <div>Low-level Delta Velocity: <b>${cellProperties.lldv} kts</b>
    <div>Maximum Delta Velocity: <b>${cellProperties.mxdv} kts</b>
    <div>Height of Max Delta Velocity: <b>${cellProperties.mvdvhgt} kft</b>
    <div>Depth: <b>${cellProperties.depth} kft</b>
    <div>Base: <b>${cellProperties.base} kft</b>
    <div>Top: <b>${cellProperties.top} kft</b>
    <div>Maximum Shear: <b>${cellProperties.maxshear} m/s/km</b>
    <div>Height of Max Shear: <b>${cellProperties.maxshearheight} kft</b>`

                // new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000', maxHeight: '300' })
                //     .setLngLat(JSON.parse(properties.coords))
                //     .setHTML(popupHTML)
                //     .addTo(map);
                new AtticPopup(JSON.parse(properties.coords), popupHTML).add_to_map();
            // }
        }
        map.on('click', 'tvsInitialPoint', cellClick);
        map.on('mouseenter', 'tvsInitialPoint', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'tvsInitialPoint', () => { map.getCanvas().style.cursor = ''; });

        setLayerOrder();

        var isSTVisChecked = $('#armrSTVisBtnSwitchElem').is(':checked');
        if (!isSTVisChecked) {
            if (tvs_layers != undefined) {
                for (var i in tvs_layers) {
                    map.setLayoutProperty(tvs_layers[i], 'visibility', 'none');
                }
            }
        }
    })
}

module.exports = plot_tornado_vortex_signature;