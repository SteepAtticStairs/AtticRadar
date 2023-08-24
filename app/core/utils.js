/*
* https://nordicapis.com/10-free-to-use-cors-proxies/
* https://allorigins.win/
*/
// https://attic-server.herokuapp.com/proxy/index.php/?
// http://server.steepatticstairs.net/AtticServer/proxy/index.php/?

// https://php-cors-proxy.herokuapp.com/?
const phpProxy = 'https://attic-server.herokuapp.com/proxy/index.php/?'; //https://api.allorigins.win/raw?url=';
// const phpProxy2 = 'https://attic-server.herokuapp.com/proxy/index.php/?'; // http://127.0.0.1:3333/server/AtticServer/proxy/?
//const phpProxy  = 'https://salty-citadel-44916.herokuapp.com/';
//const phpProxy  = 'https://secret-retreat-45871.herokuapp.com/'
//const phpProxy  = 'https://circumvent-cors.herokuapp.com/';
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
        'sr-ref': 'TZ0',
        'lr-ref': 'TZL',
        'tdwrVel': 'TV0',
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
        'sr-ref': 'TZ1',
        'tdwrVel': 'TV1',
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
        'sr-ref': 'TZ2',
        'tdwrVel': 'TV2',
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
    'sr-ref': [1, 2, 3],
    'lr-ref': [1],
    'tdwrVel': [1, 2, 3],
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

var productUnits = {
    'REF': 'dBZ', // level 2 reflectivity
    'VEL': 'm/s', // level 2 velocity
    'SW ': 'mph', // level 2 spectrum width
    'ZDR': 'dB', // level 2 differential reflectivity
    'RHO': '%', // level 2 correlation coefficient
    'PHI': 'deg', // level 2 differential phase shift

    'N0B': 'dBZ', // super-res reflectivity
    'N0G': 'm/s', // super-res velocity
    'N0C': '%', // correlation coefficient
    'N0X': 'dB', // differential reflectivity
    'NSW': 'mph', // spectrum width
    'NXQ': 'dBZ', // digital reflectivity
    'N0U': 'm/s', // digital base velocity
    'DVL': 'kg/m²', // vertically integrated liquid
    'N0S': 'knots', // storm relative velocity

    'TZX': 'dBZ', // tdwr short-range reflectivity
    'TZL': 'dBZ', // tdwr long-range reflectivity
    'TVX': 'm/s', // tdwr base velocity
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
    $.getJSON('./resources/radarStations.json', function(data) {
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
    $('#modeMenuItem').css({
        "-webkit-filter": "brightness(75%)",
        "filter": "brightness(75%)"
    });
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

function _return_css_color(class_name) {
    return $(`.${class_name}`).css('backgroundColor');
}
var sshwsValues = [
    ['Tropical Depression', _return_css_color('TD'), 'TD'],
    ['Tropical Storm', _return_css_color('TS'), 'TS'],
    ['Category 1', _return_css_color('C1'), 'C1'],
    ['Category 2', _return_css_color('C2'), 'C2'],
    ['Category 3', _return_css_color('C3'), 'C3'],
    ['Category 4', _return_css_color('C4'), 'C4'],
    ['Category 5', _return_css_color('C5'), 'C5'],
    ['Other', _return_css_color('OTHER'), 'Other'],
    ['Unknown', _return_css_color('UNKNOWN'), '?']
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
    } else if (windSpeed == 'Other') {
        return sshwsValues[7]
    } else if (windSpeed == 'Unknown') {
        return sshwsValues[8]
    }
}
// https://www.nrlmry.navy.mil/atcf_web/docs/database/new/abdeck.txt
// DB - disturbance, 
// TD - tropical depression, 
// TS - tropical storm, 
// TY - typhoon, 
// ST - super typhoon, 
// TC - tropical cyclone, 
// HU - hurricane, 
// SD - subtropical depression,
// SS - subtropical storm,
// EX - extratropical systems,
// PT - post tropical,
// IN - inland,
// DS - dissipating,
// LO - low,
// WV - tropical wave,
// ET - extrapolated,
// MD - monsoon depression,
// XX - unknown.
var hurricaneTypesAbbvs = {
    'DB': 'Disturbance',
    'TD': 'Tropical Depression',
    'TS': 'Tropical Storm',
    'TY': 'Typhoon',
    'ST': 'Super Typhoon',
    'TC': 'Tropical Cyclone',
    'HU': 'Hurricane',
    'SD': 'Subtropical Depression',
    'SS': 'Subtropical Storm',
    'EX': 'Extratropical System',
    'PT': 'Post Tropical',
    'IN': 'Inland',
    'DS': 'Dissipating',
    'LO': 'Low Pressure Area',
    'WV': 'Tropical Wave',
    'ET': 'Extrapolated',
    'MD': 'Monsoon Depression',
    'XX': 'Unknown',
    'EXPT': 'Extratropical / Post-Tropical'
}

function spawnModal(options) {
    var title = options.title;
    var headerColor = options.headerColor;
    var body = options.body;
    var css = options.css;

    var modalContent =
        `<div class="modal fade" tabindex="-1" aria-labelledby="jsModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header alert ${headerColor}">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="${css}">${body}</div>
                </div>
            </div>
        </div>`

    var domObj = $(modalContent);
    domObj.modal('show');
}

function betterProgressBar(whatToDo, value) {
    function setWidth(percent) {
        $('#progressBar').animate({
            width: `${percent}%`
        }, 0);
    }

    if (whatToDo == 'set') {
        setWidth(value);
    } else if (whatToDo == 'add') {
        // https://stackoverflow.com/a/23236691/18758797
        var w = $('#progressBar').css('width').slice(0, -2);
        var ww = $(window).width();
        var curVal = w / ww * 100;

        setWidth(value + parseFloat(curVal));
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

function CtoF(val) {
    return (val * 1.8) + 32;
}
function MBtoINHG(val) {
    return val / 33.864;
}

function getRadialConstants(radVersion) {
    var gateRes;
    var multiplier;
    // different gate resolutions for hi-res vs non hi-res data
    if (radVersion == "01") {
        // version 01 is non hi-res data
        gateRes = 2000;
        multiplier = gateRes*8;
    } else if (radVersion == "E2") {
        // version 01 is non hi-res data
        gateRes = 500;
        multiplier = gateRes*32;
    } else if (radVersion == "08") {
        // version 08 is level 2 TDWR
        gateRes = 150;
        multiplier = gateRes*1.2;
    } else if (radVersion == "l3") {
        // version l3 is level 3 data
        gateRes = 125;
        multiplier = gateRes*2;
    } else if (radVersion == "NXQ" || radVersion == "N0S") {
        // different resolution for l3 base reflectivity
        gateRes = 500;
        multiplier = gateRes*2;
    } else if (radVersion == "DVL" || radVersion == "NSW") {
        // different resolution for vertically integrated liquid
        gateRes = 500;
        multiplier = gateRes*2;
    } else if (radVersion == "TZX") {
        // different resolution for TDWR short-range reflectivity
        gateRes = 73.7;
        multiplier = gateRes*2;
        // gateRes = parseFloat($('#gateRes').val());
        // multiplier = gateRes*parseFloat($('#multiplier').val());
    } else if (radVersion == "TVX") {
        // different resolution for TDWR base velocity
        gateRes = 73.7;
        multiplier = gateRes*2;
        // gateRes = parseFloat($('#gateRes').val());
        // multiplier = gateRes*parseFloat($('#multiplier').val());
    } else if (radVersion == "TZL") {
        // different resolution for TDWR long-range reflectivity
        gateRes = 150;
        multiplier = gateRes*2;
    } else {
        // everything else (new l2 files - hi-res)
        gateRes = 125;
        multiplier = gateRes*2;
    }

    return {
        gateRes,
        multiplier
    }
}

// https://stackoverflow.com/a/544429/18758797
function getDateDiff(date1, date2) {
    var diff = Date.parse( date2 ) - Date.parse( date1 );
    var isNegative = (diff < 0);
    if (isNegative) {
        // negative
        diff = Math.abs(diff);
    }
    return isNaN( diff ) ? NaN : {
        //diff : diff,
        ms : Math.floor( diff            % 1000 ),
        s  : Math.floor( diff /     1000 %   60 ),
        m  : Math.floor( diff /    60000 %   60 ),
        h  : Math.floor( diff /  3600000 %   24 ),
        d  : Math.floor( diff / 86400000        ),
        negative: isNegative
    }
}

function csvToJson(csv) {
    function onlySpaces(str) { return str.trim().length === 0; }

    var obj = {};
    var rows = csv.split('\n');
    for (var row in rows) {
        var curRowItem = rows[row].split(',');
        for (var i in curRowItem) {
            curRowItem[i] = curRowItem[i].replace(/ /g, '')
        }
        obj[row] = curRowItem;
    }
    return obj;
}

function animateBrightness(startVal, stopVal, duration, div) {
    // https://stackoverflow.com/a/20082518/18758797
    $({blurRadius: startVal}).animate({blurRadius: stopVal}, {
        duration: duration,
        easing: 'linear',
        step: function() {
            $(div).css({
                "-webkit-filter": "brightness("+this.blurRadius+"%)",
                "filter": "brightness("+this.blurRadius+"%)"
            });
        }
    });
}

function haMapControlActions(mode, value) {
    if (mode == 'show') {
        $('#hurricaneArchiveMapControl').show();
        if ($('#dataDiv').data('isHaControlMinimized')) { $('#haMapControlMinimize').click() }
    } else if (mode == 'hide') {
        //if (!$('#dataDiv').data('isHaControlMinimized')) { $('#haMapControlMinimize').click() }
        $('#hurricaneArchiveMapControl').hide();
        $('#haMapControlText').hide();
    } else if (mode == 'text') {
        $('#haMapControlText').show();
        document.getElementById('haMapControlText').innerHTML = value;
    }
}

function zeroPad(num, length) {
    length = length || 2; // defaults to 2 if no parameter is passed
    return (new Array(length).join('0') + num).slice(length*-1);
}

function setMapMargin(topOrBottom, value, map_obj = undefined) {
    const map = require('./map/map');

    if (topOrBottom == 'top') {
        $('#map').css('top', value);
        $('.colorPickerCircle').css('top', value);
    } else if (topOrBottom == 'bottom') {
        $('#map').css('bottom', value);
        $('.colorPickerCircle').css('bottom', value);
        $('#colorPickerText').css('bottom', value - 80);
    }
    if (map_obj == undefined) {
        map.resize();
    } else {
        map_obj.resize();
    }

    // $('#colorPicker #colorPickerText').position({
    //     my: 'center',
    //     at: 'center',
    //     of: $('#map')
    // })
}

function displayAtticDialog(options) {
    var title = options.title;
    var body = options.body;
    var color = options.color;
    var textColor = options.textColor;

    $('#atcDlg').show();

    $('#atcDlgHeaderText').html(title);
    $('#atcDlgHeader').css('background-color', color);
    //$('#atticDialogHeaderContainer').css('background-color', color);
    $('#atcDlgHeader').css('color', textColor);
    $('#atcDlgClose').css('color', textColor);

    $('#atcDlgBody').scrollTop(0);
    $('#atcDlgBody').html(body);

    // const headerHeight = $('#atticDialogHeaderContainer').height();
    // var contentHeight = 0;
    // $('#atticDialogBody').children().each(function() { contentHeight = contentHeight + $(this).height() })
    //$('#atticDialogContainer').height(headerHeight + contentHeight);
    // var bodyHeight = $('#atticDialogBody').outerHeight();
    // console.log(bodyHeight)
    // $('#atticDialogContainer').height(bodyHeight);
}

function scaleValues(values, product) {
    if (['N0G', 'N0U', 'VEL', 'TVX', 'TV0', 'TV1', 'TV2'].includes(product)) {
        // velocity - convert from knots (what is provided in the colortable) to m/s (what the radial gates are in)
        for (var i in values) { if (values[i] != -999) { values[i] = values[i] / 1.944 } }
    } else if (product == 'N0S') {
        // storm relative velocity
        for (var i in values) { if (values[i] != -999) { values[i] = values[i] - 0.5 } }
    } else if (product == 'N0H' || product == 'HHC') {
        // hydrometer classification || hybrid hydrometer classification
        for (var i in values) { if (values[i] != -999) { values[i] = values[i] + 0.5 } }
    }
    return values;
}

function loadingSpinner(truefalse) {
    var opts = {
        lines: 10, // The number of lines to draw
        length: 38, // The length of each line
        width: 17, // The line thickness
        radius: 45, // The radius of the inner circle
        scale: 0.5, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        speed: 1, // Rounds per second
        rotate: 0, // The rotation offset
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#ffffff', // CSS color or array of colors
        fadeColor: 'transparent', // CSS color or array of colors
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        zIndex: 2000000000, // The z-index (defaults to 2e9)
        className: 'spinner', // The CSS class to assign to the spinner
        position: 'absolute', // Element positioning
    }
    var target = document.body;
    if (window.theLoadingSpinner == undefined) {
        window.theLoadingSpinner = new Spin.Spinner(opts).spin(target);
    }

    if (!truefalse) {
        window.theLoadingSpinner.stop();
        window.theLoadingSpinner = undefined;
    }
}

module.exports = {
    phpProxy,
    // phpProxy2,
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
    productUnits,
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
    hurricaneTypesAbbvs,
    spawnModal,
    betterProgressBar,
    CtoF,
    MBtoINHG,
    getRadialConstants,
    getDateDiff,
    csvToJson,
    animateBrightness,
    haMapControlActions,
    zeroPad,
    setMapMargin,
    displayAtticDialog,
    scaleValues,
    loadingSpinner
}