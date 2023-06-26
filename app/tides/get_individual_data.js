const luxon = require('luxon');

function get_individual_data(station_id, alt_name, ref_date, callback) {
    // "yLLdd" = YYYYMMDD = 20230621
    const start_day_formatted = luxon.DateTime.fromJSDate(ref_date).minus({ days: 1 }).toFormat('yLLdd');
    const end_day_formatted = luxon.DateTime.fromJSDate(ref_date).plus({ days: 1 }).toFormat('yLLdd');

    const tide_data_url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${start_day_formatted}&end_date=${end_day_formatted}&datum=MLLW&station=${station_id}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    fetch(tide_data_url)
    .then(response => response.json())
    .then(tide_data => {
        const tide_height_array = [];
        for (var i = 0; i < tide_data.predictions.length; i++) {
            const value = parseFloat(tide_data.predictions[i].v);
            const type = tide_data.predictions[i].type;
            // we need to replace the space in the middle with a T and append a Z, because safari won't parse the string otherwise
            const time = new Date(tide_data.predictions[i].t.replace(' ', 'T'));

            tide_height_array.push([time.getTime(), value, type]);
        }

        callback(tide_height_array, alt_name);
    })
}

module.exports = get_individual_data;