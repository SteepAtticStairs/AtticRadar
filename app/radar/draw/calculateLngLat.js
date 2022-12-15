const chroma = require('chroma-js');
const ut = require('../utils');

// https://stackoverflow.com/a/8188682/18758797
function splitUp(arr, n) {
    var rest = arr.length % n, // how much to divide
        restUsed = rest, // to keep track of the division over the elements
        partLength = Math.floor(arr.length / n),
        result = [];

    for (var i = 0; i < arr.length; i += partLength) {
        var end = partLength + i,
            add = false;

        if (rest !== 0 && restUsed) { // should add one element for the division
            end++;
            restUsed--; // we've used one division element now
            add = true;
        }

        result.push(arr.slice(i, end)); // part of the array

        if (add) {
            i++; // also increment i in the case we added an extra element for division
        }
    }

    return result;
}

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
    return parseFloat(ut.scale(num, 0, 255, 0, 1).toFixed(3));
}

function deg2rad(angle) { return angle * (Math.PI / 180) }

var radarLatLng;
const decimalPlaceTrim = 5;

var inv = 180 / Math.PI;
var re = 6371;
var radarLat;
var radarLon;

function calcLngLat(x, y) {
    var rho = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var c = rho / re;
    var lat = Math.asin(Math.cos(c) * Math.sin(radarLat) + (y * Math.sin(c) * Math.cos(radarLat)) / (rho)) * inv;
    var lon = (radarLon + Math.atan((x * Math.sin(c)) / (rho * Math.cos(radarLat) * Math.cos(c) - y * Math.sin(radarLat) * Math.sin(c)))) * inv;

    //return proj4('EPSG:3857', [lon, lat]);
    return [
        parseFloat(lon.toFixed(decimalPlaceTrim)),
        parseFloat(lat.toFixed(decimalPlaceTrim))
    ]
}

// this formula was provided by ChatGPT. crazy.
function fwdAzimuthProj(az, distance) {
    // convert distance from meters to kilometers
    distance = distance * 1000;

    // Define the starting latitude and longitude
    const lat1 = radarLatLng.lat; // 45.0
    const lon1 = radarLatLng.lng; // -75.0

    // Convert the azimuth and starting coordinates to radians
    const azRad = az * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);

    // the earth radius in meters
    const earthRadius = 6378137.0;

    // Calculate the destination latitude and longitude in radians
    const lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(distance / earthRadius) + Math.cos(lat1Rad) * Math.sin(distance / earthRadius) * Math.cos(azRad));
    const lon2Rad = lon1Rad + Math.atan2(Math.sin(azRad) * Math.sin(distance / earthRadius) * Math.cos(lat1Rad), Math.cos(distance / earthRadius) - Math.sin(lat1Rad) * Math.sin(lat2Rad));

    // Convert the destination latitude and longitude from radians to degrees
    const lat2 = lat2Rad * (180 / Math.PI);
    const lon2 = lon2Rad * (180 / Math.PI);

    //return [lon2, lat2]
    return [
        parseFloat(lon2.toFixed(decimalPlaceTrim)),
        parseFloat(lat2.toFixed(decimalPlaceTrim))
    ]
}

// https://github.com/TankofVines/node-vincenty
function destVincenty(az, distance) {
    function toRad(degree) { return degree * (Math.PI / 180) }
    function toDeg(radian) { return radian * (180 / Math.PI) }

    // convert azimuth to bearing
    var brng = az;
    // convert distance from meters to kilometers
    var dist = distance * 1000;
    var lat1 = radarLatLng.lat;
    var lon1 = radarLatLng.lng;

    /*
    * Define Earth's ellipsoidal constants (WGS-84 ellipsoid)
    */
    // length of semi-major axis of the ellipsoid (radius at equator) - meters
    var a = 6378137;
    // flattening of the ellipsoid
    var f = 1 / 298.257223563; // (a − b) / a
    // length of semi-minor axis of the ellipsoid (radius at the poles) - meters
    var b = 6356752.3142; // (1 − ƒ) * a

    var s = dist;
    var alpha1 = toRad(brng);
    var sinAlpha1 = Math.sin(alpha1);
    var cosAlpha1 = Math.cos(alpha1);

    var tanU1 = (1 - f) * Math.tan(toRad(lat1));
    var cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
    var sigma1 = Math.atan2(tanU1, cosAlpha1);
    var sinAlpha = cosU1 * sinAlpha1;
    var cosSqAlpha = 1 - sinAlpha * sinAlpha;
    var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

    var sigma = s / (b * A), sigmaP = 2 * Math.PI;
    while (Math.abs(sigma - sigmaP) > 1e-12) {
        var cos2SigmaM = Math.cos(2 * sigma1 + sigma);
        var sinSigma = Math.sin(sigma);
        var cosSigma = Math.cos(sigma);
        var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
            B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;
    }

    var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    var lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
        (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
    var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
    var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    var L = lambda - (1 - C) * f * sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    var lon2 = (toRad(lon1) + L + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180...+180

    var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing, if required

    //var result = { lat: toDeg(lat2), lon: toDeg(lon2), finalBearing: toDeg(revAz) };
    var result = [toDeg(lon2), toDeg(lat2)];

    return result;
}

// module.exports = function (self) {
//     self.addEventListener('message', function(ev) {
    function calculateLngLat(ev, cb) {
        var start = Date.now();

        var prod_range = ev.data[0];
        var az = ev.data[1];
        var prodValues = ev.data[2];

        radarLatLng = ev.data[3];
        radarLat = deg2rad(radarLatLng.lat); // 35.33305740356445
        radarLon = deg2rad(radarLatLng.lng); // -97.27748107910156

        var scaleColors = ev.data[4];
        var scaleValues = ev.data[5];
        var mode = ev.data[6];
        var chromaScale = chroma.scale(scaleColors).domain(scaleValues).mode('lab');

        function mc(coords) {
            function mercatorXfromLng(lng) {
                return (180 + lng) / 360;
            }
            function mercatorYfromLat(lat) {
                return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
            }
            return [mercatorXfromLng(coords[0]), mercatorYfromLat(coords[1])];
        }

        function calcLocs(i, n) {
            var xloc = prod_range[n] * Math.sin(deg2rad(az[i]));
            var yloc = prod_range[n] * Math.cos(deg2rad(az[i]));
            return {
                'xloc': xloc,
                'yloc': yloc
            }
        }

        function getAzDistance(i, n) {
            return {
                'azimuth': az[i],
                'distance': prod_range[n]
            }
        }

        var goodIndexes = [];
        for (var i in prodValues) {
            var goodIndexesArr = [];
            var n = 0;
            for (var el in prodValues[i]) {
                if (prodValues[i][el] != null) { goodIndexesArr.push(n) }
                n++;
            }
            goodIndexes.push(goodIndexesArr);
        }
        for (var i in prodValues) { prodValues[i] = prodValues[i].filter(function (el) { return el != null }) }

        var total = 0;
        for (var i in prodValues) { total += prodValues[i].length }

        var points = new Float32Array(total * 12);
        var pointsIndex = 0;
        function pushPoint(value) {
            points[pointsIndex] = value;
            pointsIndex++;
        }

        var colors = new Float32Array(total * 6);
        var colorsIndex = 0;
        function pushColor(value) {
            colors[colorsIndex] = value;
            colorsIndex++;
        }

        var geojsonValues = [];
        for (var i in az) {
            for (var n in prodValues[i]) {
                //if (prodValues[i][n] != null) {
                    try {
                        var theN = goodIndexes[i][n];
                        var baseLocs = getAzDistance(i, theN);
                        //var base = destVincenty(baseLocs.azimuth, baseLocs.distance);

                        var oneUpLocs = getAzDistance(i, parseInt(theN) + 1);
                        //var oneUp = destVincenty(oneUpLocs.azimuth, oneUpLocs.distance);

                        var oneSidewaysLocs = getAzDistance(parseInt(i) + 1, theN);
                        //var oneSideways = destVincenty(oneSidewaysLocs.azimuth, oneSidewaysLocs.distance);

                        var otherCornerLocs = getAzDistance(parseInt(i) + 1, parseInt(theN) + 1);
                        //var otherCorner = destVincenty(otherCornerLocs.azimuth, otherCornerLocs.distance);

                        if (mode == 'mapPlot') {
                            pushPoint(baseLocs.azimuth);
                            pushPoint(baseLocs.distance);

                            pushPoint(oneUpLocs.azimuth);
                            pushPoint(oneUpLocs.distance);

                            pushPoint(oneSidewaysLocs.azimuth);
                            pushPoint(oneSidewaysLocs.distance);
                            pushPoint(oneSidewaysLocs.azimuth);
                            pushPoint(oneSidewaysLocs.distance);

                            pushPoint(oneUpLocs.azimuth);
                            pushPoint(oneUpLocs.distance);

                            pushPoint(otherCornerLocs.azimuth);
                            pushPoint(otherCornerLocs.distance);


                            pushColor(prodValues[i][n]);
                            pushColor(prodValues[i][n]);
                            pushColor(prodValues[i][n]);
                            pushColor(prodValues[i][n]);
                            pushColor(prodValues[i][n]);
                            pushColor(prodValues[i][n]);
                            // var colorAtVal = chromaScaleToRgbString(chromaScale(prodValues[i][n]));
                            // var arrayColorAtVal = rgbValToArray(colorAtVal);
                            // var r = scaleForWebGL(arrayColorAtVal[0]);
                            // var g = scaleForWebGL(arrayColorAtVal[1]);
                            // var b = scaleForWebGL(arrayColorAtVal[2]);
                            // var a = 1;
                            // colors.push(
                            //     r, g, b, a,
                            //     r, g, b, a,
                            //     r, g, b, a,
                            //     r, g, b, a,
                            //     r, g, b, a,
                            //     r, g, b, a,
                            // )
                        } else if (mode == 'geojson') {
                            var base = destVincenty(baseLocs.azimuth, baseLocs.distance);
                            var oneUp = destVincenty(oneUpLocs.azimuth, oneUpLocs.distance);
                            var oneSideways = destVincenty(oneSidewaysLocs.azimuth, oneSidewaysLocs.distance);
                            var otherCorner = destVincenty(otherCornerLocs.azimuth, otherCornerLocs.distance);

                            geojsonValues.push(base[0], base[1], oneUp[0], oneUp[1], otherCorner[0], otherCorner[1], oneSideways[0], oneSideways[1], prodValues[i][n]);
                        }
                    } catch (e) {
                        // console.warn(e)
                    }
                //}
            }
        }
        console.log(`Calculated vertices in ${Date.now() - start} ms`);
        if (mode == 'mapPlot') {
            // self.postMessage
            cb({'data': [points, colors]});
        } else if (mode == 'geojson') {
            // self.postMessage
            cb({'data': geojsonValues});
        }

        // var pointsChunks = [];
        // var colorsChunks = [];
        // //console.log(points.length, colors.length)

        // const numOfChunks = 10;
        // pointsChunks = splitUp(points, numOfChunks);
        // colorsChunks = splitUp(colors, numOfChunks);
        // //for (let i = 0; i < points.length; i += points.length / numOfChunks) { pointsChunks.push(points.slice(i, i + colors.length / numOfChunks)) }
        // //for (let i = 0; i < colors.length; i += colors.length / numOfChunks) { colorsChunks.push(colors.slice(i, i + colors.length / numOfChunks)) }

        // var i = 0;
        // function myLoop() {
        //     setTimeout(function () {
        //         self.postMessage([pointsChunks[i], colorsChunks[i], numOfChunks])
        //         i++;
        //         if (i < numOfChunks) { myLoop() }
        //     }, 5)
        // }
        // myLoop();
        // // self.postMessage([
        // //     new Float32Array(points),
        // //     new Float32Array(colors)
        // // ]);
    }
//     })
// };

module.exports = calculateLngLat;