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
    return ut.scale(num, 0, 255, 0, 1);
}

function deg2rad(angle) { return angle * (Math.PI / 180) }

var radarLatLng;
const decimalPlaceTrim = 5;

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
    return [
        parseFloat(lon.toFixed(decimalPlaceTrim)),
        parseFloat(lat.toFixed(decimalPlaceTrim))
    ]
}

module.exports = function (self) {
    self.addEventListener('message', function(ev) {
        var start = Date.now();

        var prod_range = ev.data[0];
        var az = ev.data[1];
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

        function calcLocs(i, n) {
            var xloc = prod_range[n] * Math.sin(deg2rad(az[i]));
            var yloc = prod_range[n] * Math.cos(deg2rad(az[i]));
            return {
                'xloc': xloc,
                'yloc': yloc
            }
        }

        var points = [];
        var colors = [];
        for (var i in az) {
            for (var n in prod_range) {
                if (prodValues[i][n] != null) {
                    try {
                        var baseLocs = calcLocs(i, n);
                        var base = calcLngLat(baseLocs.xloc, baseLocs.yloc);

                        var oneUpLocs = calcLocs(i, parseInt(n) + 1);
                        var oneUp = calcLngLat(oneUpLocs.xloc, oneUpLocs.yloc);

                        var oneSidewaysLocs = calcLocs(parseInt(i) + 1, n);
                        var oneSideways = calcLngLat(oneSidewaysLocs.xloc, oneSidewaysLocs.yloc);

                        var otherCornerLocs = calcLocs(parseInt(i) + 1, parseInt(n) + 1);
                        var otherCorner = calcLngLat(otherCornerLocs.xloc, otherCornerLocs.yloc);

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
        console.log(`Calculated vertices in ${Date.now() - start} ms`);
        self.postMessage([
            new Float32Array(points),
            new Float32Array(colors)
        ]);

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
    })
};