const chroma = require('chroma-js');
const ut = require('../utils');
const calcGPU = require('./calcGPU');
var work = require('webworkify');

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

    function getAzDistance(i, n) {
        return {
            'azimuth': az[i],
            'distance': prod_range[n]
        }
    }

    // var goodIndexes = [];
    // for (var i in prodValues) {
    //     var goodIndexesArr = [];
    //     var n = 0;
    //     for (var el in prodValues[i]) {
    //         if (prodValues[i][el] != null) { goodIndexesArr.push(n) }
    //         n++;
    //     }
    //     goodIndexes.push(goodIndexesArr);
    // }
    // for (var i in prodValues) { prodValues[i] = prodValues[i].filter(function (el) { return el != null }) }

    var total = 0;
    var pv = [...prodValues];
    /*
    * This is code to fill in all neigboring radar pixels for color interpolation.
    */
    // for (var i in pv) {
    //     for (var n in pv[i]) {
    //         try {
    //             i = parseInt(i);
    //             n = parseInt(n);

    //             var pixelTrackerArray = [];
    //             var curPixel = pv[i][n];
    //             var top = pv[i][n + 1];
    //             var right = pv[i + 1][n];
    //             var bottom = pv[i][n - 1];
    //             var left = pv[i - 1][n];
    //             pixelTrackerArray.push(top, right, bottom, left);
    //             var directionLookup = ['top', 'right', 'bottom', 'left'];

    //             for (var x = 0; x < pixelTrackerArray.length; x++) {
    //                 if (pixelTrackerArray[x] == null && curPixel != null && curPixel != 999) {
    //                     var nullPixelDirection = directionLookup[x];

    //                     if (nullPixelDirection == 'top') { pv[i][n + 1] = 999 }
    //                     else if (nullPixelDirection == 'right') { pv[i + 1][n] = 999 }
    //                     else if (nullPixelDirection == 'bottom') { pv[i][n - 1] = 999 }
    //                     else if (nullPixelDirection == 'left') { pv[i - 1][n] = 999 }
    //                 }
    //             }
    //         } catch (e) {}
    //     }
    // }
    for (var i in pv) {
        pv[i] = pv[i].filter(function (el) { return el != null });
        total += pv[i].length;
    }

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

    for (var i in az) {
        for (var n in prod_range) {
            try {
                if (prodValues[i][n] != null) {
                    //var theN = parseInt(goodIndexes[i][n]);
                    i = parseInt(i);
                    n = parseInt(n);
                    var baseLocs = getAzDistance(i, n);
                    //var base = destVincenty(baseLocs.azimuth, baseLocs.distance);

                    var oneUpLocs = getAzDistance(i, n + 1);
                    //var oneUp = destVincenty(oneUpLocs.azimuth, oneUpLocs.distance);

                    var oneSidewaysLocs = getAzDistance(i + 1, n);
                    //var oneSideways = destVincenty(oneSidewaysLocs.azimuth, oneSidewaysLocs.distance);

                    var otherCornerLocs = getAzDistance(i + 1, n + 1);
                    //var otherCorner = destVincenty(otherCornerLocs.azimuth, otherCornerLocs.distance);

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

                    // pushColor(prodValues[i][n]);
                    // pushColor(prodValues[i][n + 1]);
                    // pushColor(prodValues[i + 1][n]);
                    // pushColor(prodValues[i + 1][n]);
                    // pushColor(prodValues[i][n + 1]);
                    // pushColor(prodValues[i + 1][n + 1]);
                }
            } catch (e) {
                // console.warn(e)
            }
        }
    }

    // points = calcGPU(points, radarLatLng);
    var w = work(require('./calcWorker.js'));
    w.addEventListener('message', function(ev) {
        console.log(`Calculated vertices in ${Date.now() - start} ms`);
        cb({'data': [ev.data, colors]});
    })
    w.postMessage([points, radarLatLng], [points.buffer]);

    // console.log(`Calculated vertices in ${Date.now() - start} ms`);
    // cb({'data': [points, colors]});
}

module.exports = calculateLngLat;