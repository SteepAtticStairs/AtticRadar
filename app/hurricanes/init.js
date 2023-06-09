const jtwc_fetch_data = require('./jtwc/jtwc_fetch_data');
const Hurricane = require('./Hurricane');
const icons = require('../core/map/icons/icons');
const create_circle_with_text = require('../core/misc/create_circle_with_text');
const ut = require('../core/utils');

function init_hurricane_loading() {
    jtwc_fetch_data((jtwc_storage) => {
        const TD_circle = create_circle_with_text('TD', ut.sshwsValues[0][1], 'black', 200, 1.2, false);
        const TS_circle = create_circle_with_text('TS', ut.sshwsValues[1][1], 'black', 200, 1.2, false);
        const C1_circle = create_circle_with_text('C1', ut.sshwsValues[2][1], 'black', 200, 1.2, false);
        const C2_circle = create_circle_with_text('C2', ut.sshwsValues[3][1], 'black', 200, 1.2, false);
        const C3_circle = create_circle_with_text('C3', ut.sshwsValues[4][1], 'black', 200, 1.2, false);
        const C4_circle = create_circle_with_text('C4', ut.sshwsValues[5][1], 'black', 200, 1.2, false);
        const C5_circle = create_circle_with_text('C5', ut.sshwsValues[6][1], 'black', 200, 1.2, false);

        icons.add_icon_svg([
            [TD_circle, 'TD'],
            [TS_circle, 'TS'],
            [C1_circle, 'C1'],
            [C2_circle, 'C2'],
            [C3_circle, 'C3'],
            [C4_circle, 'C4'],
            [C5_circle, 'C5'],
        ], () => {
            window.atticData.hurricane_layers = [];
            // console.log(jtwc_storage);

            const keys = Object.keys(jtwc_storage);
            for (var i = 0; i < keys.length; i++) {
                const storm_id = keys[i];
                const cone = jtwc_storage[storm_id].cone;
                const forecast_track = jtwc_storage[storm_id].forecast_track;
                const points = jtwc_storage[storm_id].forecast_points;
                const point_properties = jtwc_storage[storm_id].forecast_point_properties;

                const cyclone = new Hurricane(storm_id, cone, forecast_track, points, point_properties);
                cyclone.plot();
                console.log(cyclone);
            }
        });
    });
}

module.exports = init_hurricane_loading;