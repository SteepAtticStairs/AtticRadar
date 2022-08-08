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
        'rho': '161c0',
        'zdr': '159x0',
        'sw ': 'p30sw',
        'hhc': '177hh',
        'hyc': '165h0',
        'srv': '56rm0',
        'vil': '134il',
        'sti': '58sti',
        'mcy': '141md',
    },
    'tilt2': {
        'ref': 'N1B',
        'N0B': 'N1B',
        'vel': 'NAG',
        'N0G': 'NAG',
        'lowres-ref': 'p94r1',
        'lowres-vel': 'p99v1',
        'rho': '161c1',
        'zdr': '159x1',
        'sw ': 'p30sw',
        'hhc': '177hh',
        'hyc': '165h1',
        'srv': '56rm1',
        'vil': '134il',
        'sti': '58sti',
    },
    'tilt3': {
        'ref': 'N2B',
        'N0B': 'N2B',
        'vel': 'N1G',
        'N0G': 'N1G',
        'lowres-ref': 'p94r2',
        'lowres-vel': 'p99v2',
        'rho': '161c2',
        'zdr': '159x2',
        'sw ': 'p30sw',
        'hhc': '177hh',
        'hyc': '165h2',
        'srv': '56rm2',
        'vil': '134il',
        'sti': '58sti',
    },
    'tilt4': {
        'ref': 'N3B',
        'N0B': 'N3B',
        'vel': 'N3G',
        'N0G': 'N3G',
        'lowres-ref': 'p94r3',
        'lowres-vel': 'p99v3',
        'rho': '161c3',
        'zdr': '159x3',
        'sw ': 'p30sw',
        'hhc': '177hh',
        'hyc': '165h3',
        'srv': '56rm3',
        'vil': '134il',
        'sti': '58sti',
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

module.exports = {
    phpProxy,
    toBuffer,
    printFancyTime,
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
    blobToString
}