/*
* https://nordicapis.com/10-free-to-use-cors-proxies/
* https://allorigins.win/
*/
const phpProxy = 'https://api.allorigins.win/raw?url=';
const phpProxy2 = 'https://php-cors-proxy.herokuapp.com/?';
//const phpProxy = 'https://php-cors.000webhostapp.com/?';
//const phpProxy = 'https://php-cors-proxy.herokuapp.com/?';

const colors = {
    'red': 'rgb(255, 0, 0)',
    'darkRed': 'rgb(170, 0, 0)',

    'green': 'rgb(17, 167, 17)',
    'darkGreen': 'rgb(13, 118, 13)',

    'blue': 'rgb(92, 157, 255)',
    'darkBlue': 'rgb(27, 78, 155)',
}

function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

function printFancyTime(dateObj, tz) {
    var timeZ = new Date().toLocaleTimeString(undefined, {timeZoneName: 'short'}).split(' ')[2];
    if (tz == 'UTC') {
        timeZ = 'UTC';
    }
    return dateObj.toLocaleDateString(undefined, {timeZone: tz}) + " " + dateObj.toLocaleTimeString(undefined, {timeZone: tz}) + ` ${timeZ}`;
}
function printHourMin(dateObj, tz) {
    return dateObj.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: tz })
}
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}
function msToTime(s) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return {
        'hours': pad(hrs),
        'minutes': pad(mins),
        'seconds': pad(secs),
        'milliseconds': pad(ms, 3),
    }
    //return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
function findTerminalCoordinates(startLat, startLng, distanceNM, bearingDEG) {
    var metersInNauticalMiles = 1852;
    var startPoint = { latitude: startLat, longitude: startLng };
    var distanceMeters = distanceNM * metersInNauticalMiles;
    var bearing = bearingDEG;
    const destination = geolib.computeDestinationPoint(
        startPoint,
        distanceMeters,
        bearing 
    );
    return destination;
}

function logToModal(textContent) {
    console.log(textContent);
    function openMessageModal() {
        $("#messageDialog").dialog({
            modal: true,
            // https://stackoverflow.com/a/30624445/18758797
            open: function () {
                $(this).parent().css({
                    position: 'absolute',
                    top: 10,
                    maxHeight: '70vh',
                    overflow: 'scroll'
                });
            },
        });
    }
    if (!($("#messageDialog").dialog('instance') == undefined)) {
        // message box is already initialized
        if (!$('#messageDialog').closest('.ui-dialog').is(':visible')) {
            // message box is initialized but hidden - open it
            openMessageModal();
        }
    } else if ($("#messageDialog").dialog('instance') == undefined) {
        // message box is not initialized, open it
        openMessageModal();
    }
    $('#messageBox').append(`<div>${textContent}</div>`);
    $("#messageBox").animate({ scrollTop: $("#messageBox")[0].scrollHeight }, 0);
}

function xmlToJson(xml) {
    if (typeof xml == "string") {
        parser = new DOMParser();
        xml = parser.parseFromString(xml, "text/xml");
    }
    // Create the return object
    var obj = {};
    // console.log(xml.nodeType, xml.nodeName );
    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    }
    else if (xml.nodeType == 3 ||
        xml.nodeType == 4) { // text and cdata section
        obj = xml.nodeValue
    }
    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].length) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                if (typeof (obj[nodeName]) === 'object') {
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
    }
    return obj;
}
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    var k = 1024;
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function colorLog(content, color, otherCss) {
    // https://stackoverflow.com/a/13017382
    // console.log('%cHello', 'color: green');
    console.log(`%c${content}`, `color: ${color}; ${otherCss}`);
}

const Elem = e => ({
    tagName: 
        e.tagName,
    textContent:
        e.textContent,
    attributes:
        Array.from(e.attributes, ({name, value}) => [name, value]),
    children:
        Array.from(e.children, Elem)
})
const html2json = e =>
    JSON.stringify(Elem(e), null, '  ')

var tiltObject = {
    'tilt1': {
        'ref': 'N0B',
        'N0B': 'N0B',
        'vel': 'N0G',
        'N0G': 'N0G',
        'lowres-ref': 'p94r0',
        'lowres-vel': 'p99v0',
        'rho': 'N0C',
        'zdr': 'N0X',
        'sw ': 'p30sw',
        'hhc': 'HHC',
        'hyc': 'N0H',
        'srv': 'N0S',
        'vil': '134il',
        'sti': 'NST',
        'mcy': 'NMD',
    },
    'tilt2': {
        'ref': 'N1B',
        'N0B': 'N1B',
        'vel': 'NAG',
        'N0G': 'NAG',
        'lowres-ref': 'p94r1',
        'lowres-vel': 'p99v1',
        'rho': 'N1C',
        'zdr': 'N1X',
        'sw ': 'p30sw',
        'hhc': 'HHC',
        'hyc': 'N1H',
        'srv': 'N1S',
        'vil': '134il',
        'sti': 'NST',
    },
    'tilt3': {
        'ref': 'N2B',
        'N0B': 'N2B',
        'vel': 'N1G',
        'N0G': 'N1G',
        'lowres-ref': 'p94r2',
        'lowres-vel': 'p99v2',
        'rho': 'N2C',
        'zdr': 'N2X',
        'sw ': 'p30sw',
        'hhc': 'HHC',
        'hyc': 'N2H',
        'srv': 'N2S',
        'vil': '134il',
        'sti': 'NST',
    },
    'tilt4': {
        'ref': 'N3B',
        'N0B': 'N3B',
        'vel': 'N3G',
        'N0G': 'N3G',
        'lowres-ref': 'p94r3',
        'lowres-vel': 'p99v3',
        'rho': 'N3C',
        'zdr': 'N3X',
        'sw ': 'p30sw',
        'hhc': 'HHC',
        'hyc': 'N3H',
        'srv': 'N3S',
        'vil': '134il',
        'sti': 'NST',
    },
}
var numOfTiltsObj = {
    'ref': [1, 2, 3, 4],
    'vel': [1, 2],
    'lowres-ref': [1, 2, 3, 4],
    'lowres-vel': [1, 2, 3, 4],
    'rho': [1, 2, 3, 4],
    'zdr': [1, 2, 3, 4],
    'sw ': [1],
    'hhc': [1],
    'hyc': [1, 2, 3, 4],
    'srv': [1, 2, 3, 4],
    'vil': [1],
    'sti': [1],
}
var numOfTiltsObj = {
    'ref': [1, 2, 3, 4],
    'vel': [1, 2, 3],
    'lowres-ref': [1, 2, 3, 4],
    'lowres-vel': [1, 2, 3, 4],
    'rho': [1, 2, 3, 4],
    'zdr': [1, 2, 3, 4],
    'sw ': [1],
    'hhc': [1],
    'hyc': [1, 2, 3, 4],
    'srv': [1, 2, 3, 4],
    'vil': [1],
    'sti': [1],
}
var allL2Btns = [
    'l2-ref',
    'l2-vel',
    'l2-rho',
    'l2-phi',
    'l2-zdr',
    'l2-sw '
];

// https://wdssii.nssl.noaa.gov/web/wdss2/products/radar/systems/w2vcp.shtml
// https://www.weather.gov/jetstream/vcp_max
// https://www.roc.noaa.gov/WSR88D/Operations/VCP.aspx
var vcpObj = {
    '12': 'Precip Mode',
    '31': 'Clean Air Mode',
    '32': 'Clean Air Mode',
    '35': 'Clean Air Mode',
    '112': 'Precip Mode',
    '121': 'Precip Mode',
    '212': 'Precip Mode',
    '215': 'Precip Mode',

    '80': 'Precip Mode',
    '90': 'Precip Mode',
}

function blobToString(b) {
    var u, x;
    u = URL.createObjectURL(b);
    x = new XMLHttpRequest();
    x.open('GET', u, false); // although sync, you're not fetching over internet
    x.send();
    URL.revokeObjectURL(u);
    return x.responseText;
}

function addDays(startDateObj, daysToAdd) {
    var date = startDateObj;
    date.setDate(date.getDate() + daysToAdd);
    return date;
}

// https://stackoverflow.com/a/23202637
function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
* Various functions to do with the progress bar.
*
* @param {any} whatToDo - What action to perform to the progress bar.

'set': sets the bar to a fixed value. e.g. progressBarVal('set', 36);

'add': adds a value to the current progress bar value. e.g. progressBarVal('add', 14.7);

'getRemaining': gets the amount of space left on the progress bar until it is full. e.g. console.log(progressBarVal('getRemaining'));

* @param {any} value - The value specifying how much to set / add / etc. Not required for all actions.
*/
function progressBarVal(whatToDo, value) {
    if (whatToDo == 'set') {
        var actualPercent = value;
        if (value > 1000) {
            actualPercent = scale(value, 0, 150, 0, $('#progBar').attr('aria-valuemax'));
            console.log(actualPercent);
        }
        $('#progBar').css('width', actualPercent + '%').attr('aria-valuenow', value);
    } else if (whatToDo == 'add') {
        var curVal = $('#progBar').attr('aria-valuenow');
        $('#progBar').css('width', (value + parseInt(curVal)) + '%').attr('aria-valuenow', (value + parseInt(curVal)));
    } else if (whatToDo == 'getRemaining') {
        var curVal = $('#progBar').attr('aria-valuenow');
        var totalVal = $('#progBar').attr('aria-valuemax');
        return totalVal - curVal;
    } else if (whatToDo == 'hide') {
        $('#progBarParent').hide();
    } else if (whatToDo == 'show') {
        $('#progBarParent').show();
    } else if (whatToDo == 'label') {
        console.log(value);
        document.getElementById('progBar').innerHTML = value;
    }
}
function getDividedArray(num) {
    var divider = 4;
    var finishedArr = [];
    for (var i = 1; i < divider + 1; i++) {
        finishedArr.push((num / divider) * i);
    }
    return finishedArr;
}

const tideChartDivName = 'container';

// https://dev.to/kapantzak/waiting-for-visible-element-4ck9
function elementVisible(elem) {
    return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}
function waitVisible(elem, callback, timeout) {
    let timer = setInterval(() => {
        if (elementVisible(elem)) {
            callback();
            clearInterval(timer);
            timer = null;
        }
    }, 10);
    const tm = timeout || 5000;
    setTimeout(() => {
        if (timer) {
            clearInterval(timer);
        }
    }, tm);
}

function flyToStation() {
    var map = require('./map/map');

    var shtation = document.getElementById('fileStation').innerHTML;
    $.getJSON('https://steepatticstairs.github.io/AtticRadar/resources/radarStations.json', function(data) {
		var statLat;
		var statLng;
		if (data.hasOwnProperty(shtation)) {
			statLat = data[shtation][1];
			statLng = data[shtation][2];
		} else {
			var fileNameStation = $('#dataDiv').data('fileName').slice(0, 4);
			statLat = data[fileNameStation][1];
			statLng = data[fileNameStation][2];
		}
		// map.flyTo({
        //     center: [statLng, statLat],
        //     zoom: 8,
        //     duration: 1000,
        // });
    });
}

function disableModeBtn() {
    $('#dataDiv').data('noMoreClicks', true);
    $('#modeMenuItemClass').css('opacity', 0.25);
}

function knotsToMph(knots, decimals) {
    return (knots * 1.151).toFixed(decimals);
}
// https://stackoverflow.com/a/25867068/18758797
function degToCompass(num, icons) {
    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    if (icons == true) {
        arr = ["↑ N", "↑↗ NNE", "↗ NE", "→↗ ENE", "→ E", "↘→ ESE", "↘ SE", "↓↘ SSE", "↓ S", "↙↓ SSW", "↙ SW", "←↙ WSW", "← W", "↖← WNW", "↖ NW", "↖↑ NNW"];
    }
    return arr[(val % 16)];
}
// https://gist.github.com/basarat/4670200?permalink_comment_id=2067650#gistcomment-2067650
function getCardinalDirection(angle) {
    if (typeof angle === 'string') angle = parseInt(angle);
    if (angle <= 0 || angle > 360 || typeof angle === 'undefined') return '☈';
    const arrows = { north: '↑ N', north_east: '↗ NE', east: '→ E', south_east: '↘ SE', south: '↓ S', south_west: '↙ SW', west: '← W', north_west: '↖ NW' };
    const directions = Object.keys(arrows);
    const degree = 360 / directions.length;
    angle = angle + degree / 2;
    for (let i = 0; i < directions.length; i++) {
      if (angle >= (i * degree) && angle < (i + 1) * degree) return arrows[directions[i]];
    }
    return arrows['north'];
}

function preventFileCaching(url) {
    var curTime = new Date();
    return url += `&?nocache=${curTime.getTime()}`;
}

var sshwsValues = [
    ['Tropical Depression', '#348feb', 'TD'],
    ['Tropical Storm', '#12cc47', 'TS'],
    ['Category 1', '#ebcb2f', 'C1'],
    ['Category 2', '#eb932f', 'C2'],
    ['Category 3', '#eb642f', 'C3'],
    ['Category 4', '#eb3b2f', 'C4'],
    ['Category 5', '#eb2f87', 'C5']
]
function getSSHWSVal(windSpeed) {
    if (windSpeed <= 38) {
        return sshwsValues[0]; // TD
    } else if (windSpeed >= 39 && windSpeed <= 73) {
        return sshwsValues[1]; // TS
    } else if (windSpeed >= 74 && windSpeed <= 95) {
        return sshwsValues[2]; // C1
    } else if (windSpeed >= 96 && windSpeed <= 110) {
        return sshwsValues[3]; // C2
    } else if (windSpeed >= 111 && windSpeed <= 129) {
        return sshwsValues[4]; // C3
    } else if (windSpeed >= 130 && windSpeed <= 156) {
        return sshwsValues[5]; // C4
    } else if (windSpeed >= 157) {
        return sshwsValues[6]; // C5
    }
}

function spawnModal(options) {
    var title = options.title;
    var headerColor = options.headerColor;
    var body = options.body;

    var modalContent =
        `<div class="modal fade" tabindex="-1" aria-labelledby="jsModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header alert ${headerColor}">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">${body}</div>
                </div>
            </div>
        </div>`

    var domObj = $(modalContent);
    domObj.modal('show');
}

function betterProgressBar(whatToDo, value) {
    if (whatToDo == 'set') {
        $('#progressBar').css('width', `${value}%`)
    } else if (whatToDo == 'add') {
        var curVal = $('#progressBar').css('width')
        $('#progressBar').css('width', (value + parseInt(curVal)) + '%');
    } else if (whatToDo == 'getRemaining') {
        var curVal = $('#progressBar').css('width');
        var totalVal = 100;
        return totalVal - parseInt(curVal);
    } else if (whatToDo == 'hide') {
        $('#progressBar').hide();
    } else if (whatToDo == 'show') {
        $('#progressBar').show();
    } else if (whatToDo == 'label') {
        //console.log(value);
        //document.getElementById('progBar').innerHTML = value;
    }
}

module.exports = {
    phpProxy,
    phpProxy2,
    colors,
    toBuffer,
    printFancyTime,
    printHourMin,
    userTimeZone,
    addMinutes,
    msToTime,
    round,
    findTerminalCoordinates,
    logToModal,
    xmlToJson,
    formatBytes,
    colorLog,
    html2json,
    tiltObject,
    numOfTiltsObj,
    allL2Btns,
    vcpObj,
    blobToString,
    addDays,
    progressBarVal,
    getDividedArray,
    scale,
    tideChartDivName,
    waitVisible,
    flyToStation,
    disableModeBtn,
    knotsToMph,
    degToCompass,
    getCardinalDirection,
    preventFileCaching,
    sshwsValues,
    getSSHWSVal,
    spawnModal,
    betterProgressBar
}