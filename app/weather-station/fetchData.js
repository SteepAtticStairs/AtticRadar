const plotData = require('./plotData');
const ut = require('../radar/utils');

function fetchData(iconElem) {
    // class valueWithUnits {
    //     constructor (value, units) {
    //         this.value = value;
    //         this.units = units;
    //     }
    // }
    class WeatherFlow_OBS_ST {
        constructor (data) {
            const base = data.obs[0];
            this.epoch = base[0]; // seconds
            this.windLull = base[1]; // m/s
            this.windAverage = base[2]; // m/s
            this.windGust = base[3]; // m/s
            this.windDirection = base[4]; // degrees
            this.windSampleInterval = base[5]; // seconds
            this.stationPressure = base[6]; // mb
            this.airTemp = base[7]; // C
            this.relativeHumidity = base[8]; // %
            this.illuminance = base[9]; // lux
            this.UV = base[10]; // index
            this.solarRadiation = base[11]; // W/m^2
            this.rainAccumulated = base[12]; // mm

            var pt = base[13];
            if (pt == 0) { pt = 'none' }
            else if (pt == 1) { pt = 'rain' }
            else if (pt == 2) { pt = 'hail' }
            this.precipitationType = pt;

            this.lightningStrikeAvgDistance = base[14]; // km
            this.lightningStrikeCount = base[15];
            this.battery = base[16]; // volts
            this.reportInterval = base[17]; // minutes
            this.localDailyRainAccumulation = base[18]; // mm
            this.rainAccumulatedFinal = base[19]; // mm
            this.localDailyRainAccumulationFinal = base[20]; // mm

            var pat = base[21];
            if (pat == 0) { pat = 'none' }
            else if (pat == 1) { pat = 'rainCheckWithUserDisplayOn' }
            else if (pat == 2) { pat = 'rainCheckWithUserDisplayOff' }
            this.precipitationAnalysisType = pat;
        }
    }

    // const token = 'private';

    // const listStationsUrl = `https://swd.weatherflow.com/swd/rest/stations?token=${token}`;
    // $.getJSON(listStationsUrl, function(listStationsData) {
    //     const stationID = listStationsData.stations[0].station_id;
    //     const latestObservationsUrl = `https://swd.weatherflow.com/swd/rest/observations/station/${stationID}?token=${token}`;

    //     $.getJSON(latestObservationsUrl, function(loData) { plotData(loData, loData.obs[0]) })
    // })

    $.getJSON('https://attic-server.herokuapp.com/weather-station/index.php', function(data) {
        if ($(iconElem).hasClass('icon-blue')) {
            $(iconElem).removeClass('icon-blue');
            $(iconElem).addClass('icon-grey');
        }
        ut.loadingSpinner(false);
        plotData(data, data.observations);
    })

    // function processData(data) {
    //     if (data.type == 'obs_st') {
    //         const parsedData = new WeatherFlow_OBS_ST(data);
    //         console.log(parsedData.airTemp);
    //     } else { console.log(data) }
    // }

    // const wsUrl = `wss://ws.weatherflow.com/swd/data?token=${token}`;
    // const ws = new WebSocket(wsUrl);

    // ws.onmessage = (e) => { processData(JSON.parse(e.data)) }
    // ws.onerror = (e) => { console.error(e) }
    // ws.onopen = (e) => {
    //     ws.send(JSON.stringify({
    //         'type': 'listen_start',
    //         'device_id': 00000,
    //         'id': 'random-id-12345'
    //     }))
    // }
}

module.exports = fetchData;