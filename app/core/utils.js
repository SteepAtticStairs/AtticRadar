const phpProxy = 'https://corsproxy.io/?url=';

function printFancyTime(dateObj, tz) {
    var timeZ = new Date().toLocaleTimeString(undefined, {timeZoneName: 'short'}).split(' ')[2];
    if (tz == 'UTC') {
        timeZ = 'UTC';
    }
    return dateObj.toLocaleDateString(undefined, {timeZone: tz}) + " " + dateObj.toLocaleTimeString(undefined, {timeZone: tz}) + ` ${timeZ}`;
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

// https://stackoverflow.com/a/23202637
function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function preventFileCaching(url) {
    var curTime = new Date();
    return url += `&?nocache=${curTime.getTime()}`;
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

module.exports = {
    phpProxy,
    printFancyTime,
    xmlToJson,
    formatBytes,
    colorLog,
    scale,
    preventFileCaching,
    getDateDiff,
    csvToJson,
}