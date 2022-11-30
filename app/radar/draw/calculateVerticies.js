const ut = require('../utils');
const productColors = require('../products/productColors');
const chroma = require('chroma-js');
const plotRadarToMap = require('./plotRadarToMap');
const radarStations = require('../../../resources/radarStations');
const stationAbbreviations = require('../../../resources/stationAbbreviations');
const maxRanges = require('../level3/maxRanges');
var work = require('webworkify');

function rgbValToArray(rgbString) {
    return rgbString
            .replace('rgb(', '')
            .replace('rgba(', '')
            .replace(')', '')
            .split(', ')
}
function chromaScaleToRgbString(scaleOutput) {
    return `rgb(${parseInt(scaleOutput._rgb[0])}, ${parseInt(scaleOutput._rgb[1])}, ${parseInt(scaleOutput._rgb[2])})`
}
function scaleForWebGL(num) {
    return ut.scale(num, 0, 255, 0, 1);
}

function npDiff(arr) {
    var returnArr = [];
    for (var i in arr) {
        i = parseInt(i);
        var theDiff = arr[i + 1] - arr[i];
        if (!Number.isNaN(theDiff)) {
            if (theDiff > 180) { theDiff -= 360 }
            if (theDiff < -180) { theDiff += 360 }
            returnArr.push(theDiff);
        }
    }
    return returnArr;
}
const mean = array => array.reduce((a, b) => a + b) / array.length;
function removeLast(arr) {
	arrCopy = [...arr];
	arrCopy.pop();
    return arrCopy;
}
function removeFirst(arr) {
	arrCopy = [...arr];
	arrCopy.shift();
    return arrCopy;
}

// https://stackoverflow.com/a/40475362/18758797
function npLinspace(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
}

function deg2rad(angle) { return angle * (Math.PI / 180) }
function getXlocs(ref_range, az) {
    var xlocs = [];
    for (var i in az) {
        var newRow = [];
        for (var n in ref_range) {
            newRow.push(ref_range[n] * Math.sin(deg2rad(az[i])));
        }
        xlocs.push(newRow);
    }
    return xlocs;
}
function getYlocs(ref_range, az) {
    var ylocs = [];
    for (var i in az) {
        var newRow = [];
        for (var n in ref_range) {
            newRow.push(ref_range[n] * Math.cos(deg2rad(az[i])));
        }
        ylocs.push(newRow);
    }
    return ylocs;
}

function getRadarLatLng(radarObj, level) {
    function hasWhiteSpace(s) {
        return s.indexOf(' ') >= 0;
    }
    if (level == 2) {
        if (radarObj?.data[1][0]?.record?.volume?.hasOwnProperty('latitude')) {
            return {
                'lat': radarObj.data[1][0].record.volume.latitude,
                'lng': radarObj.data[1][0].record.volume.longitude
            }
        } else if (!hasWhiteSpace(radarObj.header.ICAO)) {
            var icao = radarObj.header.ICAO;
            return {
                'lat': radarStations[icao][1],
                'lng': radarStations[icao][2]
            }
        }
    } else if (level == 3) {
        if (radarObj?.productDescription?.hasOwnProperty('latitude')) {
            return {
                'lat': radarObj.productDescription.latitude,
                'lng': radarObj.productDescription.longitude
            }
        } else if (radarObj?.textHeader?.hasOwnProperty('id3')) {
            var icao = stationAbbreviations[l3rad.textHeader.id3];
            return {
                'lat': radarStations[icao][1],
                'lng': radarStations[icao][2]
            }
        }
    }
}

const dataNames = {
    'REF': 'reflect',
    'VEL': 'velocity',
    'SW ': 'spectrum',	// intentional space to fill 3-character requirement
    'ZDR': 'zdr',
    'PHI': 'phi',
    'RHO': 'rho',
};

function calculateVerticies(radarObj, level, options) {
    var product;
    var elevation;
    if (level == 2) {
        product = options.product;
        elevation = options.elevation;
    } else if (level == 3) {
        // product = radarObj.textHeader.type;
        product = radarObj.productDescription.abbreviation;
        if (Array.isArray(product)) { product = product[0] }
    }

    var az = [];
    if (level == 2) {
        for (var i in radarObj.data[elevation]) { az.push(radarObj.data[elevation][i].record.azimuth) }
    } else if (level == 3) {
        for (var i in radarObj.radialPackets[0].radials) { az.push(radarObj.radialPackets[0].radials[i].startAngle) }
    }
    az.push(az[0]);

    var prodValues = [];
    if (level == 2) {
        for (var i in radarObj.data[elevation]) { prodValues.push(radarObj.data[elevation][i].record[dataNames[product]].moment_data) }
    } else if (level == 3) {
        for (var i in radarObj.radialPackets[0].radials) { prodValues.push(radarObj.radialPackets[0].radials[i].bins) }
    }
    prodValues.push(prodValues[0]);

    // var diff = npDiff(az);
    // var avg_spacing = mean(diff);

    // var rL = removeLast(az);
    // var rF = removeFirst(az);

    // az = [];
    // for (var i in rL) { az.push((rL[i] + rF[i]) / 2) }
    // az.unshift(az[0] - avg_spacing);
    // az.push(az[az.length - 1] + avg_spacing);

    var prod_range;
    if (level == 2) {
        var prod_hdr = radarObj.data[elevation][0].record[dataNames[product]];
        var gate_count = prod_hdr.gate_count;
        var gate_size = prod_hdr.gate_size;
        var first_gate = prod_hdr.first_gate;
        // level 2 = 1832 0.25 2.125
        prod_range = [...Array(gate_count + 1).keys()];
        for (var i in prod_range) {
            prod_range[i] = (prod_range[i] - 0.5) * gate_size + first_gate;
        }
    } else if (level == 3) {
        var prod_hdr = radarObj.radialPackets[0];
        var maxRange = maxRanges[radarObj.messageHeader.code]; // km
        prod_range = npLinspace(0, maxRange, prod_hdr.numberBins + 1)
        // gate_count = prod_hdr.numberBins;
        // gate_size = prod_hdr.radials[0].angleDelta;
        // first_gate = prod_hdr.firstBin;
    }

    // xlocs = prod_range * np.sin(np.deg2rad(az[:, np.newaxis]))
    // ylocs = prod_range * np.cos(np.deg2rad(az[:, np.newaxis]))
    var xlocs = getXlocs(prod_range, az);
    var ylocs = getYlocs(prod_range, az);

    function mc(coords) {
        var mercatorCoords = mapboxgl.MercatorCoordinate.fromLngLat({ lng: coords[0], lat: coords[1] });
        return [mercatorCoords.x, mercatorCoords.y];
    }

    var colorData = productColors[product];
    var values = [...colorData.values];
    values = ut.scaleValues(values, product);
    var chromaScale = chroma.scale(colorData.colors).domain(values).mode('lab');
    //console.log(chromaScaleToRgbString(chromaScale(10)))
    // console.log(values)

    // var radarLat = radians(radarLat); // radians(oEvent.data[2]);
    // var radarLon = radians(radarLon); // radians(oEvent.data[3]);
    // var inv = 180.0/3.141592654;
    // var re = 6371000.0;
    // var phi = radians(phi)//radians(oEvent.data[1]);
    // var h0 = 0.0;

    // var mathaz = radians(90.0 - az);
    // var h = Math.sqrt(Math.pow(range,2.0)+Math.pow(((4./3.)*re+h0),2.0)+2.*range*((4./3.)*re+h0)*Math.sin(phi))-(4./3.)*re;
    // var ca = Math.acos((Math.pow(range,2.0)-Math.pow(re,2.0)-Math.pow(re+h,2.0))/(-2.0*re*(re+h)));
    // var xcart = (ca*re)*Math.cos(mathaz);
    // var ycart = (ca*re)*Math.sin(mathaz);
    // //convert to latitude longitude
    // var rho = Math.sqrt(Math.pow(xcart,2.0)+Math.pow(ycart,2.0));
    // var c = rho/re;
    // var lat = Math.asin(Math.cos(c)*Math.sin(radarLat)+(ycart*Math.sin(c)*Math.cos(radarLat))/(rho))*inv;
    // lon = (radarLon + Math.atan((xcart*Math.sin(c))/(rho*Math.cos(radarLat)*Math.cos(c)-ycart*Math.sin(radarLat)*Math.sin(c))))*inv;

    var radarLatLng = getRadarLatLng(radarObj, level);

    // var chunksReturned = 0;
    // var verticiesArr = [];
    // var colorsArr = [];

    /*
    * We are using a web worker for this because the heavy calculations
    * that need to run will crash the website on a mobile browser.
    */
    var w = work(require('./calculateLngLat.js'));
    w.addEventListener('message', function(ev) {
        // var currentPointsChunkIter = ev.data[0];
        // var currentColorsChunkIter = ev.data[1];
        // var totalChunks = ev.data[2];
        // verticiesArr = verticiesArr.concat(currentPointsChunkIter);
        // //console.log(vertices.length)
        // colorsArr = colorsArr.concat(currentColorsChunkIter);
        // chunksReturned++;
        // if (totalChunks == chunksReturned) {
        //     var points = new Float32Array(verticiesArr);
        //     var colors = new Float32Array(colorsArr);
        //     plotRadarToMap(points, colors, product);
        // }
        var points = ev.data[0];
        var colors = ev.data[1];
        for (var i = 0; i < points.length - 1; i += 2) {
            var mercCoords = mc([points[i], points[i + 1]])
            points[i] = mercCoords[0];
            points[i + 1] = mercCoords[1];
        }
        plotRadarToMap(points, colors, product);
    });
    w.postMessage([xlocs, ylocs, prodValues, radarLatLng, colorData.colors, values]); // send the worker a message

    //plotRadarToMap(points, colors, product);
    // var vertexF32 = new Float32Array(points);
    // var colorF32 = new Float32Array(colors);

    // console.log(vertexF32)
    // console.log(colorF32)
}

module.exports = calculateVerticies;