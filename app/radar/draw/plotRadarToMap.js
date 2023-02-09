const createAndShowColorbar = require('./mapColorbar');
const productColors = require('../products/productColors');
const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');
const setBaseMapLayers = require('../misc/baseMapLayers');
// const STstuff = require('../level3/stormTracking/archive/stormTrackingMain');
const initStormTracks = require('../level3/stormTracking/fetchData');
var map = require('../map/map');
const setLayerOrder = require('../map/setLayerOrder');
const createWebGLTexture = require('./createWebGLTexture');
const vertexSource = require('./glsl/vertex.glsl');
const fragmentSource = require('./glsl/fragment.glsl');
const fragmentFramebufferSource = require('./glsl/fragmentFramebuffer.glsl');

const mathjs = math;

function plotRadarToMap(verticiesArr, colorsArr, product, radarLatLng) {
    var colorScaleData = productColors[product];
    var colors = colorScaleData.colors;
    var values = [...colorScaleData.values];
    values = ut.scaleValues(values, product);
    const cmin = values[0];
    window.atticData.cmin = cmin;
    const cmax = values[values.length - 1];
    window.atticData.cmax = cmax;

    //var vertexF32 = new Float32Array(verticiesArr);
    //var colorF32 = new Float32Array(colorsArr);
    var vertexF32 = verticiesArr;
    var colorF32 = colorsArr;

    var imagedata;
    var imagetexture;

    var fb;
    function createFramebuffer(gl) {
        const targetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        window.atticData.fb = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, window.atticData.fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
    }
    function renderToFramebuffer(gl, matrix) {
        gl.useProgram(this.programFramebuffer);

        // set uniforms for the framebuffer shaders
        gl.uniformMatrix4fv(this.matrixLocationFramebuffer, false, matrix);
        gl.uniform2fv(this.radarLngLatLocationFramebuffer, [radarLatLng.lat, radarLatLng.lng]);
        gl.uniform2fv(this.minmaxLocationFramebuffer, [cmin, cmax]);

        // render to the framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, window.atticData.fb);

        // transparent black is no radar data
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertexF32.length / 2);

        // disable framebuffer, render to the map
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    var layer = {
        id: 'baseReflectivity',
        type: 'custom',

        onAdd: function (map, gl) {
            createAndShowColorbar(colors, values);
            // create the color scale texture
            imagedata = createWebGLTexture(colors, values);
            imagetexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, imagetexture);

            // compile the vertex shader
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexSource);
            gl.compileShader(vertexShader);

            // compile the main fragment shader
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentSource);
            gl.compileShader(fragmentShader);

            // compile the framebuffer fragment shader
            var fragmentShaderFramebuffer = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShaderFramebuffer, fragmentFramebufferSource);
            gl.compileShader(fragmentShaderFramebuffer);

            // create the main program
            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);

            // create the framebuffer program
            this.programFramebuffer = gl.createProgram();
            gl.attachShader(this.programFramebuffer, vertexShader);
            gl.attachShader(this.programFramebuffer, fragmentShaderFramebuffer);
            gl.linkProgram(this.programFramebuffer);

            // retrieve the main program's uniforms
            this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
            this.positionLocation = gl.getAttribLocation(this.program, 'aPosition');
            this.colorLocation = gl.getAttribLocation(this.program, 'aColor');
            this.textureLocation = gl.getUniformLocation(this.program, 'u_texture');
            this.minmaxLocation = gl.getUniformLocation(this.program, 'minmax');
            this.radarLngLatLocation = gl.getUniformLocation(this.program, 'radarLatLng');

            // retrieve the framebuffer program's uniforms
            this.matrixLocationFramebuffer = gl.getUniformLocation(this.programFramebuffer, 'u_matrix');
            this.minmaxLocationFramebuffer = gl.getUniformLocation(this.programFramebuffer, 'minmax');
            this.radarLngLatLocationFramebuffer = gl.getUniformLocation(this.programFramebuffer, 'radarLatLng');

            // var newVertexF32 = new Float32Array(vertexF32.length * 2);
            // var offset = 0;
            // for (var i = 0; i < vertexF32.length; i += 2) {
            //     var x = vertexF32[i];
            //     var y = vertexF32[i + 1];
            //     var f32x = x - x;
            //     var f32y = y - y;
            //     // if (f32x != 0) { console.log(x) }
            //     // if (f32y != 0) { console.log(y) }

            //     newVertexF32[offset] = x;
            //     newVertexF32[offset + 1] = y;
            //     newVertexF32[offset + 2] = f32x;
            //     newVertexF32[offset + 3] = f32y;
            //     offset += 4;
            // }

            // create and bind the buffer for the vertex data
            this.vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                vertexF32,
                gl.STATIC_DRAW
            );

            // create and bind the buffer for the color data
            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                colorF32,
                gl.STATIC_DRAW
            );

            // initialize the framebuffer
            createFramebuffer(gl);
        },
        render: function (gl, matrix) {
            // bind the buffers for the vertices, colors, and the texture
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.enableVertexAttribArray(this.positionLocation);
            gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.enableVertexAttribArray(this.colorLocation);
            gl.vertexAttribPointer(this.colorLocation, 1, gl.FLOAT, false, 0, 0);

            gl.bindTexture(gl.TEXTURE_2D, imagetexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagedata);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            /*
            * use the program to render to the framebuffer
            */
            // only render to the framebuffer if the color picker is active,
            // this helps with performance
            if ($('#colorPickerItemClass').hasClass('icon-blue')) {
                renderToFramebuffer.apply(this, [gl, matrix]);
            }

            /*
            * use the main program to render to the map
            */
            gl.useProgram(this.program);

            // set uniforms for the main shaders
            gl.uniformMatrix4fv(this.matrixLocation, false, matrix);
            gl.uniform2fv(this.radarLngLatLocation, [radarLatLng.lat, radarLatLng.lng]);
            gl.uniform2fv(this.minmaxLocation, [cmin, cmax]);
            gl.uniform1i(this.textureLocation, 0);

            // draw vertices
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.drawArrays(gl.TRIANGLES, 0, vertexF32.length / 2);
        }
    }

    mapFuncs.removeMapLayer('baseReflectivity');

    map.addLayer(layer);

    var isInFileUploadMode = $('#armrModeBtnSwitchElem').is(':checked');
    if (!isInFileUploadMode) {
        initStormTracks.initStormTracks();
        // STstuff.loadAllStormTrackingStuff();
    }

    // make sure the alerts are always on top
    setLayerOrder();

    var isRoadsStreetsVisChecked = $('#armrRoadsStreetsVisBtnSwitchElem').is(':checked');
    if (!isRoadsStreetsVisChecked) {
        setBaseMapLayers('cities');
    } else if (isRoadsStreetsVisChecked) {
        setBaseMapLayers('both');
    }

    var isRadarVisChecked = $('#armrRadarVisBtnSwitchElem').is(':checked');
    if (!isRadarVisChecked) {
        map.setLayoutProperty('baseReflectivity', 'visibility', 'none');
    }

    console.log('File plotting complete');
    ut.betterProgressBar('set', 100);
    ut.betterProgressBar('hide');

    // if ($('#colorPickerItemClass').hasClass('icon-blue')) {
    //     $('#colorPickerItemClass').click();
    // }

    var distanceMeasureMapLayers = $('#dataDiv').data('distanceMeasureMapLayers');
    for (var i in distanceMeasureMapLayers) {
        if (map.getLayer(distanceMeasureMapLayers[i])) {
            map.moveLayer(distanceMeasureMapLayers[i]);
        }
    }
    // setTimeout(function() {
    //     //$('#dataDiv').trigger('loadGeoJSON');
    //     //$('#dataDiv').data('calcPolygonsData', [url, phi, radarLat, radarLon, radVersion]);
    //     var calcPolygonsData = $('#dataDiv').data('calcPolygonsData');
    //     generateGeoJSON(calcPolygonsData[0], calcPolygonsData[1], calcPolygonsData[2], calcPolygonsData[3], calcPolygonsData[4])
    // }, 500)
}

module.exports = plotRadarToMap;