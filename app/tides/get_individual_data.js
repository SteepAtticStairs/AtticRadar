function _getYYMMDD(date_obj, type, modifier) {
    if (type === 'start') {
        date_obj.setDate(date_obj.getDate() - modifier);
    } else if (type === 'end') {
        date_obj.setDate(date_obj.getDate() + modifier);
    }

    const year = date_obj.getUTCFullYear();
    const month = (date_obj.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date_obj.getUTCDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
}

function get_individual_data(station_id, alt_name, callback) {
    // const station_info_url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${station_id}.json`;
    // fetch(station_info_url)
    // .then(response => response.json())
    // .then(station_info_data => {
    //     const name = station_info_data.stations[0].name;
    //     const id = station_info_data.stations[0].id;
    // })

    const start_day = _getYYMMDD(new Date(), 'start', 1);
    const end_day = _getYYMMDD(new Date(), 'end', 1);

    const tide_data_url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${start_day}&end_date=${end_day}&datum=MLLW&station=${station_id}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    fetch(tide_data_url)
    .then(response => response.json())
    .then(tide_data => {
        const tide_height_array = [];
        for (var i = 0; i < tide_data.predictions.length; i++) {
            const value = parseFloat(tide_data.predictions[i].v);
            // we need to replace the space in the middle with a T and append a Z, because safari won't parse the string otherwise
            const time = new Date(tide_data.predictions[i].t.replace(' ', 'T'));

            tide_height_array.push([time.getTime(), value]);
        }
        callback(tide_height_array, alt_name);
    })
}

module.exports = get_individual_data;