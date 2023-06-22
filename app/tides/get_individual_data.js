const SunCalc = require('suncalc');
const all_stations = require('./data/all_stations');

function _getYYMMDD(date_obj, type, modifier) {
    if (type === 'start') {
        date_obj.setDate(date_obj.getDate() - modifier);
    } else if (type === 'end') {
        date_obj.setDate(date_obj.getDate() + modifier);
    }

    const year = date_obj.getUTCFullYear();
    const month = (date_obj.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date_obj.getUTCDate().toString().padStart(2, '0');
    // date_obj.setHours(0, 0, 0, 0);
    return [date_obj, `${year}${month}${day}`];
}

function _get_sunrise_sunset_times(tide_height_array, station_id, start_day, end_day) {
    const daylight_color = 'rgb(217, 217, 191)';
    const nighttime_color = 'rgb(192, 197, 210)';

    const selected_station = all_stations.stations.filter(station => station.id == station_id)[0];
    const lat = selected_station.lat;
    const lng = selected_station.lng;

    const sunrises = [];
    const sunsets = [];
    for (var i = 0; i < tide_height_array.length; i++) {
        const times = SunCalc.getTimes(new Date(tide_height_array[i][0]), lat, lng);
        if (!sunrises.includes(times.sunrise.getTime())) {
            sunrises.push(times.sunrise.getTime());
        }
        if (!sunsets.includes(times.sunset.getTime())) {
            sunsets.push(times.sunset.getTime());
        }
    }

    const plot_bands = [];

    const zIndex = -2;

    if (sunrises[0] < sunsets[0]) { // sunrise came first
        plot_bands.push({ from: start_day.getTime(), to: sunrises[0], color: nighttime_color, zIndex: zIndex })
    } else if (sunrises[0] > sunsets[0]) { // sunset came first
        plot_bands.push({ from: start_day.getTime(), to: sunsets[0], color: daylight_color, zIndex: zIndex })
    }
    if (sunrises[sunrises.length - 1] < sunsets[sunsets.length - 1]) { // last space is a sunset
        plot_bands.push({ from: sunsets[sunsets.length - 1], to: end_day.getTime(), color: nighttime_color, zIndex: zIndex })
    } else if (sunrises[sunrises.length - 1] > sunsets[sunsets.length - 1]) { // last space is a sunrise
        plot_bands.push({ from: sunrises[sunrises.length - 1], to: end_day.getTime(), color: daylight_color, zIndex: zIndex })
    }

    for (var i = 0; i < sunrises.length; i++) {
        plot_bands.push({ from: sunrises[i], to: sunsets[i], color: daylight_color, zIndex: zIndex })
        if (sunrises[i + 1] != undefined) {
            plot_bands.push({ from: sunsets[i], to: sunrises[i + 1], color: nighttime_color, zIndex: zIndex })
        }
    }

    return plot_bands;
}

function get_individual_data(station_id, alt_name, callback) {
    // const station_info_url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${station_id}.json`;
    // fetch(station_info_url)
    // .then(response => response.json())
    // .then(station_info_data => {
    //     const name = station_info_data.stations[0].name;
    //     const id = station_info_data.stations[0].id;
    // })

    const [start_day, start_day_formatted] = _getYYMMDD(new Date(), 'start', 2);
    const [end_day, end_day_formatted] = _getYYMMDD(new Date(), 'end', 1);
    start_day.setHours(0, 0, 0, 0);
    end_day.setHours(23, 59, 59, 999);

    const tide_data_url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${start_day_formatted}&end_date=${end_day_formatted}&datum=MLLW&station=${station_id}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
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

        const plot_bands = _get_sunrise_sunset_times(tide_height_array, station_id, start_day, end_day);
        callback(tide_height_array, alt_name, plot_bands);
    })
}

module.exports = get_individual_data;