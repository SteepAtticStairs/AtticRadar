const calcPolys = require('./calculatePolygons');
const STstuff = require('../../level3/stormTracking/archive/stormTrackingMain');
const tt = require('../../misc/paletteTooltip');
const ut = require('../../utils');
const mapFuncs = require('../../map/mapFunctions');
const generateGeoJSON = require('../../inspector/archive/generateGeoJSON');
var map = require('../../map/map');
const setBaseMapLayers = require('../../misc/baseMapLayers');
const PNG = require('pngjs').PNG;
const chroma = require('chroma-js');
const productColors = require('../../products/productColors');
const createAndShowColorbar = require('../mapColorbar');

function scaleValues(values, product) {
    if (product == 'N0G' || product == 'N0U' || product == 'TVX' || product == 'VEL') {
        // velocity - convert from knots (what is provided in the colortable) to m/s (what the radial gates are in)
        for (var i in values) { values[i] = values[i] / 1.944 }
    } else if (product == 'N0S') {
        // storm relative velocity
        for (var i in values) { values[i] = values[i] + 0.5 }
    } else if (product == 'N0H' || product == 'HHC') {
        // hydrometer classification || hybrid hydrometer classification
        for (var i in values) { values[i] = values[i] - 0.5 }
    }
    return values;
}

var vertex_buffer;
var color_buffer;

var values;
var colors;

var settings = {};

function drawRadarShape(jsonObj, lati, lngi, produc, shouldFilter) {
    settings.rlat = lati;
    settings.rlon = lngi;
    // phi is elevation
    settings.phi = 0.483395;
    settings.base = jsonObj;

    if (Array.isArray(produc)) {
        produc = produc[0];
    }

    function finishItUp(data, colors, layer, geojson) {
        vertex_buffer = new Float32Array(data);
        color_buffer = new Float32Array(colors);
        //console.log(Math.max(...[...new Set(colors)]))
        mapFuncs.removeMapLayer('baseReflectivity');

        map.addLayer(layer);
        var isChecked = $('#showExtraMapLayersCheckBtn').is(":checked");
        if (!isChecked) {
            setBaseMapLayers('cities');
        } else if (isChecked) {
            setBaseMapLayers('both');
        }

        document.getElementById('spinnerParent').style.display = 'none';

        // load the visibility button
        // require('../map/controls/visibility');

        // load the refresh button
        // require('./refresh');

        if ($('#dataDiv').data('fromFileUpload')) {
            ut.flyToStation();
        } else {
            if ($('#dataDiv').data('stormTracksVisibility')) {
                STstuff.loadAllStormTrackingStuff();
            }
        }

        // make sure the alerts are always on top
        mapFuncs.moveMapLayer('newAlertsLayer');
        mapFuncs.moveMapLayer('newAlertsLayerOutline');

        var dividedArr = ut.getDividedArray(ut.progressBarVal('getRemaining'));

        console.log('File plotting complete');
        ut.betterProgressBar('set', 100);
        ut.betterProgressBar('hide');

        if ($('#colorPickerItemClass').hasClass('icon-blue')) {
            $('#colorPickerItemClass').click();
        }

        var distanceMeasureMapLayers = $('#dataDiv').data('distanceMeasureMapLayers');
        for (var i in distanceMeasureMapLayers) {
            if (map.getLayer(distanceMeasureMapLayers[i])) {
                map.moveLayer(distanceMeasureMapLayers[i]);
            }
        }
        // setTimeout(function() {
        //     //$("#dataDiv").trigger("loadGeoJSON");
        //     //$('#dataDiv').data('calcPolygonsData', [url, phi, radarLat, radarLon, radVersion]);
        //     var calcPolygonsData = $('#dataDiv').data('calcPolygonsData');
        //     generateGeoJSON(calcPolygonsData[0], calcPolygonsData[1], calcPolygonsData[2], calcPolygonsData[3], calcPolygonsData[4])
        // }, 500)
    }

    var data = productColors[produc.replaceAll(' ', '')];
    divider = data.divider;
    values = data.values;
    colors = data.colors;
    minMax = [values[0], values[values.length - 1]];
    values = scaleValues(values, produc);

    var layer = {
        id: "baseReflectivity",
        type: "custom",

        // method called when the layer is added to the map
        // https://docs.mapbox.com/mapbox-gl-js/api/#styleimageinterface#onadd
        onAdd: function (map, gl) {
            createAndShowColorbar(colors, values);
            // create GLSL source for vertex shader
            const vertexSource = `
                uniform mat4 u_matrix;
                attribute vec2 a_pos;
                attribute vec4 color;
                varying vec4 vColor;
                void main() {
                    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
                    vColor = color;
                }`;

            // create GLSL source for fragment shader
            const fragmentSource = `
                precision lowp float;
                varying vec4 vColor;
                void main() {
                    gl_FragColor = vec4(vColor);
                }`;

            // create a vertex shader
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexSource);
            gl.compileShader(vertexShader);

            // create a fragment shader
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentSource);
            gl.compileShader(fragmentShader);

            // link the two shaders into a WebGL program
            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);

            this.aPos = gl.getAttribLocation(this.program, 'a_pos');
            this.color = gl.getAttribLocation(this.program, 'color');

            // create and initialize a WebGLBuffer to store vertex and color data
            this.vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                vertex_buffer,
                gl.STATIC_DRAW
            );

            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                color_buffer,
                gl.STATIC_DRAW
            );
        },

        // method fired on each animation frame
        // https://docs.mapbox.com/mapbox-gl-js/api/#map.event:render
        render: function (gl, matrix) {
            gl.useProgram(this.program);
            gl.uniformMatrix4fv(
                gl.getUniformLocation(this.program, 'u_matrix'),
                false,
                matrix
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.enableVertexAttribArray(this.aPos);
            gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.enableVertexAttribArray(this.color);
            gl.vertexAttribPointer(this.color, 4, gl.FLOAT, false, 0, 0);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.drawArrays(gl.TRIANGLES, 0, vertex_buffer.length / 2);
        }
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var vers = JSON.parse(this.responseText).version;

            calcPolys.calcPolygons(
                settings.base,
                settings.phi,
                settings.rlat,
                settings.rlon,
                vers,
                values,
                colors,
                function(dat) {
                    finishItUp(dat.verticies, dat.colors, layer)
                }
            )
        }
    };
    xhttp.open("GET", jsonObj, true);
    xhttp.send();
}

module.exports = drawRadarShape;