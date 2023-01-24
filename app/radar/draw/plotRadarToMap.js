const createAndShowColorbar = require('./mapColorbar');
const productColors = require('../products/productColors');
const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');
const setBaseMapLayers = require('../misc/baseMapLayers');
const STstuff = require('../level3/stormTracking/stormTrackingMain');
var map = require('../map/map');
const setLayerOrder = require('../map/setLayerOrder');
const createWebGLTexture = require('./createWebGLTexture');
const vertexSource = require('./vertex.glsl');
const fragmentSource = require('./fragment.glsl');

const mathjs = math;

function plotRadarToMap(verticiesArr, colorsArr, product, radarLatLng) {
    var colorScaleData = productColors[product];
    var colors = colorScaleData.colors;
    var values = [...colorScaleData.values];
    values = ut.scaleValues(values, product);
    const cmin = values[0];
    const cmax = values[values.length - 1];

    //var vertexF32 = new Float32Array(verticiesArr);
    //var colorF32 = new Float32Array(colorsArr);
    var vertexF32 = verticiesArr;
    var colorF32 = colorsArr;

    var imagedata;
    var imagetexture;

    var layer = {
        id: 'baseReflectivity',
        type: 'custom',

        onAdd: function (map, gl) {
            createAndShowColorbar(colors, values);
            imagedata = createWebGLTexture(colors, values);
            imagetexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, imagetexture);

            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexSource);
            gl.compileShader(vertexShader);

            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentSource);
            gl.compileShader(fragmentShader);

            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);

            this.positionLocation = gl.getAttribLocation(this.program, 'aPosition');
            this.colorLocation = gl.getAttribLocation(this.program, 'aColor');
            this.textureLocation = gl.getUniformLocation(this.program, 'u_texture');
            this.minmaxLocation = gl.getUniformLocation(this.program, 'minmax');
            this.radarLngLatLocation = gl.getUniformLocation(this.program, 'radarLatLng');

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
        render: function (gl, matrix) {
            gl.useProgram(this.program);

            //get xyz camera coordinates and w_clip value for the camera position. (expose camera coord in mapbox so this becomes unnecessary?)
			function _get_eye(mat) {
				mat = [[mat[0],mat[4],mat[8],mat[12]],[mat[1],mat[5],mat[9],mat[13]],[mat[2],mat[6],mat[10],mat[14]],[mat[3],mat[7],mat[11],mat[15]]];
				var eye = mathjs.lusolve(mat, [[0],[0],[0],[1]]);
				var clip_w = 1.0/eye[3][0];
				eye = mathjs.divide(eye, eye[3][0]);
				eye[3][0] = clip_w;
				return mathjs.flatten(eye);
			}
			var eye_high = _get_eye(matrix);
			var eye_low = eye_high.map(function(e) { return e - Math.fround(e) });
			gl.uniform4fv(gl.getUniformLocation(this.program, 'u_eye_high'), eye_high);
			gl.uniform4fv(gl.getUniformLocation(this.program, 'u_eye_low'), eye_low);

            gl.uniformMatrix4fv(
                gl.getUniformLocation(this.program, 'u_matrix'),
                false,
                matrix
            );
            gl.uniform2fv(this.radarLngLatLocation, [radarLatLng.lat, radarLatLng.lng]);
            gl.uniform2fv(this.minmaxLocation, [cmin, cmax]);
            gl.uniform1i(this.textureLocation, 0);

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

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.drawArrays(gl.TRIANGLES, 0, vertexF32.length / 2);
        }
    }

    mapFuncs.removeMapLayer('baseReflectivity');

    map.addLayer(layer);
    var isChecked = $('#showExtraMapLayersCheckBtn').is(':checked');
    if (!isChecked) {
        setBaseMapLayers('cities');
    } else if (isChecked) {
        setBaseMapLayers('both');
    }

    // STstuff.loadAllStormTrackingStuff();

    // make sure the alerts are always on top
    setLayerOrder();

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
    //     //$('#dataDiv').trigger('loadGeoJSON');
    //     //$('#dataDiv').data('calcPolygonsData', [url, phi, radarLat, radarLon, radVersion]);
    //     var calcPolygonsData = $('#dataDiv').data('calcPolygonsData');
    //     generateGeoJSON(calcPolygonsData[0], calcPolygonsData[1], calcPolygonsData[2], calcPolygonsData[3], calcPolygonsData[4])
    // }, 500)
}

module.exports = plotRadarToMap;