const createAndShowColorbar = require('./mapColorbar');
const productColors = require('../products/productColors');
const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');
const setBaseMapLayers = require('../misc/baseMapLayers');
const STstuff = require('../level3/stormTracking/stormTrackingMain');
var map = require('../map/map');
const setLayerOrder = require('../map/setLayerOrder');
const createWebGLTexture = require('./createWebGLTexture');

function plotRadarToMap(verticiesArr, colorsArr, product) {
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

    var vertexSource = `
        //x: azimuth
        //y: range
        //z: value
        attribute vec2 aPosition;
        attribute float aColor;
        uniform mat4 u_matrix;
        varying float color;
        void main() {
            color = aColor;
            gl_Position = u_matrix * vec4(aPosition.x, aPosition.y, 0.0, 1.0);
        }`;
    var fragmentSource = `
        precision highp float;
        uniform vec2 minmax;
        uniform sampler2D u_texture;
        varying float color;
        void main() {
            float calcolor = (color - minmax.x) / (minmax.y - minmax.x);
            gl_FragColor = texture2D(u_texture, vec2(min(max(calcolor, 0.0), 1.0), 0.0));
        }`
    var layer = {
        id: "baseReflectivity",
        type: "custom",

        onAdd: function (map, gl) {
            createAndShowColorbar(colors, values);
            imagedata = createWebGLTexture(colors, values);
            imagetexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, imagetexture);

            var ext = gl.getExtension('OES_element_index_uint');
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexSource);
            gl.compileShader(vertexShader);
            var compilationLog = gl.getShaderInfoLog(vertexShader);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentSource);
            gl.compileShader(fragmentShader);
            var compilationLog = gl.getShaderInfoLog(fragmentShader);
            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);
            this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix");
            this.positionLocation = gl.getAttribLocation(this.program, "aPosition");
            this.colorLocation = gl.getAttribLocation(this.program, "aColor");
            this.textureLocation = gl.getUniformLocation(this.program, "u_texture");
            this.minmaxLocation = gl.getUniformLocation(this.program, "minmax");

            //data buffers
            this.positionBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
            this.colorBuffer = gl.createBuffer();
        },//end onAdd
        render: function (gl, matrix) {
            //console.log("render base");
            var ext = gl.getExtension('OES_element_index_uint');
            //use program
            gl.useProgram(this.program);
            //how to remove vertices from position buffer
            var size = 2;
            var type = gl.FLOAT;
            var normalize = false;
            var stride = 0;
            var offset = 0;
            //calculate matrices
            gl.uniformMatrix4fv(this.matrixLocation, false, matrix);
            gl.uniform2fv(this.minmaxLocation, [cmin, cmax])
            gl.uniform1i(this.textureLocation, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexF32, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.positionLocation);
            gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colorF32, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.colorLocation);
            gl.vertexAttribPointer(this.colorLocation, 1, type, normalize, stride, offset);

            gl.bindTexture(gl.TEXTURE_2D, imagetexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagedata)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            var primitiveType = gl.TRIANGLES;
            gl.drawArrays(primitiveType, offset, vertexF32.length / 2);

        }//end render
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
    setLayerOrder();

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