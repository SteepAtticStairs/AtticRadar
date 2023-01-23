const ut = require('../radar/utils');
const getTempColor = require('../radar/misc/tempColors');
const chroma = require('chroma-js');
var map = require('../radar/map/map');
window.map = map;

function getFormattedDateDiff(dateDiff) {
    var formattedDateDiff;
    if (dateDiff.s) { formattedDateDiff = `${dateDiff.s}s`; }
    if (dateDiff.m) { formattedDateDiff = `${dateDiff.m}m ${dateDiff.s}s`; }
    if (dateDiff.h) { formattedDateDiff = `${dateDiff.h}h ${dateDiff.m}m`; }
    if (dateDiff.d) { formattedDateDiff = `${dateDiff.d}d ${dateDiff.h}h`; }

    var cssClass;
    // less than 0 hours 1 minutes
    if (dateDiff.h == 0 && dateDiff.m < 1) { cssClass = 'new-file'; }
    // greater than or equal to 0 hours 1 minutes
    if (dateDiff.h == 0 && dateDiff.m >= 1) { cssClass = 'recent-file'; }
    // greater than 1 hour or 1 day OR greater than or equal to 0 hours 2 minutes
    if (dateDiff.h > 0 || dateDiff.d > 0 || (dateDiff.h == 0 && dateDiff.m >= 2)) { cssClass = 'old-file'; }

    return [formattedDateDiff, cssClass];
}

function plotData(data, base) {
    console.log(data);

    const toFixedWithoutZeros = (num, precision) => `${1 * num.toFixed(precision)}`;

    //const base = data.obs[0];
    var validTimeDateObj = new Date(base.timestamp * 1000);
    var validTime = ut.printFancyTime(validTimeDateObj);
    var dateDiff = ut.getDateDiff(new Date(), validTimeDateObj);
    dateDiff = getFormattedDateDiff(dateDiff); // ['23s', 'new-file']

    var temp = toFixedWithoutZeros(ut.CtoF(base.air_temperature), 1);
    var dewPoint = toFixedWithoutZeros(ut.CtoF(base.dew_point), 1);
    var pressure = toFixedWithoutZeros(ut.MBtoINHG(base.barometric_pressure), 3);
    var windSpeed = base.wind_avg;
    var windGusts = base.wind_gust;
    var windDirection = base.wind_direction;
    var tempColor = getTempColor(temp);

    const dialogContent = 
`<div style="text-align: center; font-size: 30px; color: ${tempColor[1]}; background-color: ${tempColor[0]}"><b>${temp}</b> °F</div>
<i><b>VALID: </b><b class="${dateDiff[1]}">${dateDiff[0]} ago</b> (${validTime})</i>
<b>Dew Point: </b>${dewPoint} °F
<b>Barometer: </b>${pressure} inHG

<b>Wind:</b>
${windSpeed} mph
${windGusts} mph gusts
${windDirection}° (${ut.degToCompass(windDirection)})
<img src="./resources/compass.png" class="centerImg" style="max-width: 50%; max-height: 50%; transform: rotate(${windDirection}deg)">`

    var dialogColor = chroma(tempColor[0]).alpha(0.8).css();
    var dialogTextColor = chroma(dialogColor).luminance() > 0.4 ? 'black' : 'white';
    ut.displayAtticDialog({
        'title': `AtticStation (<u style="cursor: pointer" class="icon-selected" onclick="$('#atticDialogClose').click(); window.map.flyTo({ center: [-77.0369, 38.9072], zoom: 8, speed: 2, essential: true })">DC Metro Area</u>)`,
        'body': dialogContent, //JSON.stringify(data, null, 4),
        'color': 'rgb(19, 19, 19)',
        'textColor': 'white'
    });
}

module.exports = plotData;