const chroma = require('chroma-js');
const ut = require('../utils');

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

function deg2rad(angle) { return angle * (Math.PI / 180) }

var radarLatLng;

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

module.exports = function (self) {
    self.addEventListener('message', function(ev) {
        var xlocs = ev.data[0];
        var ylocs = ev.data[1];
        var prodValues = ev.data[2];
        radarLatLng = ev.data[3];
        var scaleColors = ev.data[4];
        var scaleValues = ev.data[5];
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
        self.postMessage([
            new Float32Array(points),
            new Float32Array(colors)
        ]);
    })
};