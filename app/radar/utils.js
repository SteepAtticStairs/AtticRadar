const phpProxy = 'https://php-cors-proxy.herokuapp.com/?';

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
    return dateObj.toLocaleDateString(undefined, {timeZone: tz}) + " " + dateObj.toLocaleTimeString(undefined, {timeZone: tz}) + ` ${timeZ}`;
}
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
    '12': 'Precipitation Mode',
    '31': 'Clean Air Mode',
    '32': 'Clean Air Mode',
    '35': 'Clean Air Mode',
    '112': 'Precipitation Mode',
    '121': 'Precipitation Mode',
    '212': 'Precipitation Mode',
    '215': 'Precipitation Mode',

    '80': 'Precipitation Mode',
    '90': 'Precipitation Mode',
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

module.exports = {
    phpProxy,
    toBuffer,
    printFancyTime,
    userTimeZone,
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
    scale
}