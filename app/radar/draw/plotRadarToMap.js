const createAndShowColorbar = require('./mapColorbar');
const productColors = require('../products/productColors');
const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');
const setBaseMapLayers = require('../misc/baseMapLayers');
const STstuff = require('../level3/stormTracking/stormTrackingMain');
var map = require('../map/map');

function plotRadarToMap(verticiesArr, colorsArr, product) {
    var colorScaleData = productColors[product];
    var colors = colorScaleData.colors;
    var values = [...colorScaleData.values];
    values = ut.scaleValues(values, product);

    //var vertexF32 = new Float32Array(verticiesArr);
    //var colorF32 = new Float32Array(colorsArr);
    var vertexF32 = verticiesArr;
    var colorF32 = colorsArr;

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
                vertexF32,
                gl.STATIC_DRAW
            );

            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                colorF32,
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
            gl.drawArrays(gl.TRIANGLES, 0, vertexF32.length / 2);
        }
    }

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
    require('../map/controls/visibility');

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

module.exports = plotRadarToMap;