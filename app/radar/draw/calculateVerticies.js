const ut = require('../utils');
const productColors = require('../products/productColors');
const chroma = require('chroma-js');
const plotRadarToMap = require('./plotRadarToMap');
const radarStations = require('../../../resources/radarStations');

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
            return {
                'lat': radarStations[radarObj.header.ICAO][1],
                'lng': radarStations[radarObj.header.ICAO][2]
            }
        }
    }
}

function calculateVerticies(radarObj, level, options) {
    if (level == 2) {
        var product = options.product;
        var elevation = options.elevation;
        const dataNames = {
            'REF': 'reflect',
            'VEL': 'velocity',
            'SW ': 'spectrum',	// intentional space to fill 3-character requirement
            'ZDR': 'zdr',
            'PHI': 'phi',
            'RHO': 'rho',
        };

        var az = [];
        for (var i in radarObj.data[elevation]) { az.push(radarObj.data[elevation][i].record.azimuth) }
        az.push(az[0]);

        var prodValues = [];
        for (var i in radarObj.data[elevation]) { prodValues.push(radarObj.data[elevation][i].record[dataNames[product]].moment_data) }
        prodValues.push(prodValues[0]);

        // var diff = npDiff(az);
        // var avg_spacing = mean(diff);

        // var rL = removeLast(az);
        // var rF = removeFirst(az);

        // az = [];
        // for (var i in rL) { az.push((rL[i] + rF[i]) / 2) }
        // az.unshift(az[0] - avg_spacing);
        // az.push(az[az.length - 1] + avg_spacing);

        var prod_hdr = radarObj.data[elevation][i].record[dataNames[product]];
        var prod_range = [...Array(prod_hdr.gate_count + 1).keys()];
        for (var i in prod_range) {
            prod_range[i] = (prod_range[i] - 0.5) * prod_hdr.gate_size + prod_hdr.first_gate;
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
        function calcLngLat(x, y) {
            var inv = 180.0 / Math.PI;
            var re = 6371;
            var radarLat = deg2rad(radarLatLng.lat); // 35.33305740356445
            var radarLon = deg2rad(radarLatLng.lng); // -97.27748107910156

            var rho = Math.sqrt(Math.pow(x, 2.0) + Math.pow(y, 2.0));
            var c = rho / re;
            var lat = Math.asin(Math.cos(c) * Math.sin(radarLat) + (y * Math.sin(c) * Math.cos(radarLat)) / (rho)) * inv;
            var lon = (radarLon + Math.atan((x * Math.sin(c)) / (rho * Math.cos(radarLat) * Math.cos(c) - y * Math.sin(radarLat) * Math.sin(c)))) * inv;

            //return proj4('EPSG:3857', [lon, lat]);
            return [lon, lat];
        }

        var points = [];
        var colors = [];
        for (var i in xlocs) {
            //for (var i = 0; i < 1; i++) {
            //i = parseInt(i);
            for (var n in xlocs[i]) {
                //for (var n = 0; n < 500; n++) {
                if (prodValues[i][n] != null) {
                    try {
                        var base = mc(calcLngLat(xlocs[i][n], ylocs[i][n]));
                        var oneUp = mc(calcLngLat(xlocs[i][parseInt(n) + 1], ylocs[i][parseInt(n) + 1]));
                        var oneSideways = mc(calcLngLat(xlocs[parseInt(i) + 1][n], ylocs[parseInt(i) + 1][n]));
                        var otherCorner = mc(calcLngLat(xlocs[parseInt(i) + 1][parseInt(n) + 1], ylocs[parseInt(i) + 1][parseInt(n) + 1]));
                        points.push(
                            base[0],
                            base[1],

                            oneUp[0],
                            oneUp[1],

                            oneSideways[0],
                            oneSideways[1],
                            oneSideways[0],
                            oneSideways[1],

                            oneUp[0],
                            oneUp[1],

                            otherCorner[0],
                            otherCorner[1],
                        );

                        var colorAtVal = chromaScaleToRgbString(chromaScale(prodValues[i][n]));
                        var arrayColorAtVal = rgbValToArray(colorAtVal);
                        var r = scaleForWebGL(arrayColorAtVal[0]);
                        var g = scaleForWebGL(arrayColorAtVal[1]);
                        var b = scaleForWebGL(arrayColorAtVal[2]);
                        var a = 1;
                        colors.push(
                            r, g, b, a,
                            r, g, b, a,
                            r, g, b, a,
                            r, g, b, a,
                            r, g, b, a,
                            r, g, b, a,
                        )
                    } catch (e) { }
                }
            }
        }
        plotRadarToMap(points, colors, product);
        // var vertexF32 = new Float32Array(points);
        // var colorF32 = new Float32Array(colors);

        // console.log(vertexF32)
        // console.log(colorF32)
    }
}

module.exports = calculateVerticies;