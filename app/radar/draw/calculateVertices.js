const ut = require('../utils');
const productColors = require('../products/productColors');
const chroma = require('chroma-js');
const plotRadarToMap = require('./plotRadarToMap');
const radarStations = require('../../../resources/radarStations');
const stationAbbreviations = require('../../../resources/stationAbbreviations');
const maxRanges = require('../level3/maxRanges');
const setTextField = require('../inspector/setTextField');
const calculateLngLat = require('./calculateLngLat');
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
            // if (theDiff > 180) { theDiff -= 360 }
            // if (theDiff < -180) { theDiff += 360 }
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
    var start = Date.now();

    var mode = options.mode;
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

    /*
    * Create an array holding all of the azimuth values
    */
    var az = [];
    if (level == 2) {
        for (var i in radarObj.data[elevation]) { az.push(radarObj.data[elevation][i].record.azimuth) }
    } else if (level == 3) {
        for (var i in radarObj.radialPackets[0].radials) { az.push(radarObj.radialPackets[0].radials[i].startAngle) }
    }
    if (level == 3) { az.push(az[0]) }

    /*
    * Create an array holding all of the gate values
    */
    var prodValues = [];
    if (level == 2) {
        for (var i in radarObj.data[elevation]) { prodValues.push(radarObj.data[elevation][i].record[dataNames[product]].moment_data) }
    } else if (level == 3) {
        for (var i in radarObj.radialPackets[0].radials) { prodValues.push(radarObj.radialPackets[0].radials[i].bins) }
    }
    if (level == 3) { prodValues.push(prodValues[0]) }

    /*
    * Perform some adjustments on the azimuth values
    */
    if (level == 2) {
        var diff = npDiff(az);
        var crossed;
        for (var i in diff) { if (diff[i] < -180) { crossed = parseInt(i) } }
        diff[crossed] += 360;
        var avg_spacing = mean(diff);

        var rL = removeLast(az);
        var rF = removeFirst(az);

        az = [];
        for (var i in rL) { az.push((rL[i] + rF[i]) / 2) }
        az[crossed] += 180;
        az.unshift(az[0] - avg_spacing);
        az.push(az[az.length - 1] + avg_spacing);
    }

    /*
    * Calculate the ranges (distances from radar) for each gate
    */
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
    //var xlocs = getXlocs(prod_range, az);
    //var ylocs = getYlocs(prod_range, az);
    //console.log(`Calculated locs in ${Date.now() - start} ms`);

    // function mc(coords) {
    //     var mercatorCoords = mapboxgl.MercatorCoordinate.fromLngLat({ lng: coords[0], lat: coords[1] });
    //     return [mercatorCoords.x, mercatorCoords.y];
    // }
    function mc(coords) {
        function mercatorXfromLng(lng) {
            return (180 + lng) / 360;
        }
        function mercatorYfromLat(lat) {
            return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
        }
        return [mercatorXfromLng(coords[0]), mercatorYfromLat(coords[1])];
    }

    var colorData = productColors[product];
    var values = [...colorData.values];
    values = ut.scaleValues(values, product);

    var radarLatLng = getRadarLatLng(radarObj, level);

    // var chunksReturned = 0;
    // var verticiesArr = [];
    // var colorsArr = [];

    /*
    * We are using a web worker for this because the heavy calculations
    * that need to run will crash the website on a mobile browser.
    */
    // var w = work(require('./calculateLngLat.js'));
    // w.addEventListener('message', function(ev) {
    calculateLngLat({'data': [prod_range, az, prodValues, radarLatLng, colorData.colors, values, mode]}, function (ev) {
        if (mode == 'mapPlot') {
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
        } else if (mode == 'geojson') {
            var returnedDataArr = ev.data;

            var featuresArr = [];
            function pushPoint(lng1, lat1, lng2, lat2, lng3, lat3, lng4, lat4, value) {
                featuresArr.push({
                    "type": "Feature",
                    "geometry": { "type": "Polygon",
                        "coordinates": [
                            [
                                [lng1, lat1],
                                [lng2, lat2],
                                [lng3, lat3],
                                [lng4, lat4]
                            ]
                        ]
                    },
                    "properties": {
                        "value": value,
                    }
                },);
            }

            for (var i = 0; i < returnedDataArr.length; i += 9) {
                function x(n) { return returnedDataArr[n] }

                var inspectorVal;
                var bin = x(i+8);
                if (product == 'N0S') {
                    // storm relative velocity tweaks
                    var stormRelativeVelocityArr = [-50, -36, -26, -20, -10, -1, 0, 10, 20, 26, 36, 50, 64, 999];
                    inspectorVal = stormRelativeVelocityArr[bin - 2];
                } else if (product == 'N0C' || product == 'N0X' || product == 'DVL') {
                    // correlation coefficient || differential reflectivity || vertically integrated liquid
                    inspectorVal = bin.toFixed(2);
                } else if (product == 'N0H' || product == 'HHC') {
                    // hydrometer classification || hybrid hydrometer classification
                    var hycValues = {
                        0: 'Below Threshold', // ND
                        10: 'Biological', // BI
                        20: 'Ground Clutter', // GC
                        30: 'Ice Crystals', // IC
                        40: 'Dry Snow', // DS
                        50: 'Wet Snow', // WS
                        60: 'Light-Mod. Rain', // RA
                        70: 'Heavy Rain', // HR
                        80: 'Big Drops', // BD
                        90: 'Graupel', // GR
                        100: 'Hail / Rain', // HA
                        110: 'Large Hail', // LH
                        120: 'Giant Hail', // GH,
                        130: '130', // ??
                        140: 'Unknown', // UK
                        150: 'Range Folded' // RF
                    }
                    inspectorVal = hycValues[bin];
                } else {
                    inspectorVal = bin;
                }
                if (product != 'N0H' && product != 'HHC') {
                    // hydrometer classification || hybrid hydrometer classification
                    inspectorVal = `${inspectorVal} ${ut.productUnits[product]}`;
                }

                pushPoint(x(i), x(i+1), x(i+2), x(i+3), x(i+4), x(i+5), x(i+6), x(i+7), inspectorVal);
            }

            var geojsonParentTemplate = {
                "type": "FeatureCollection",
                "features": featuresArr
            }
            //console.log(geojsonParentTemplate);
            setTextField(geojsonParentTemplate);
        }
    });
    // w.postMessage([prod_range, az, prodValues, radarLatLng, colorData.colors, values, mode]); // send the worker a message

    //plotRadarToMap(points, colors, product);
    // var vertexF32 = new Float32Array(points);
    // var colorF32 = new Float32Array(colors);

    // console.log(vertexF32)
    // console.log(colorF32)
}

module.exports = calculateVerticies;