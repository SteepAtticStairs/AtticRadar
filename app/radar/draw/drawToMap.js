const calcPolys = require('./calculatePolygons');
const STstuff = require('../level3/stormTracking/stormTrackingMain');
const tt = require('../misc/paletteTooltip');
const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');
const generateGeoJSON = require('../inspector/generateGeoJSON');
var map = require('../map/map');
const setBaseMapLayers = require('../misc/baseMapLayers');
const PNG = require('pngjs').PNG;
const chroma = require('chroma-js');

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

function drawRadarShape(jsonObj, lati, lngi, produc, shouldFilter) {
    var settings = {};
    settings["rlat"] = lati;
    settings["rlon"] = lngi;
    // phi is elevation
    settings["phi"] = 0.483395;
    settings["base"] = jsonObj;

    if (Array.isArray(produc)) {
        produc = produc[0];
    }


    var divider;
    var values;
    var minMax;
    function createTexture(gl) {
        if ($('#mapColorScale').is(":hidden")) {
            ut.setMapMargin('bottom', '+=15px');
        }
        var offset;
        if (require('../misc/detectmobilebrowser')) {
            offset = Math.round($(window).height() * (5 / 100));
        } else {
            offset = 0;
        }
        $('#mapColorScale').css({
            'bottom': offset + $('#mapFooter').height(),
            'height': '15px'
        }).show();

        $.getJSON(`./app/radar/products/${produc}.json`, function(data) {
            //console.log(data);
            var colors = data.colors; //colors["ref"];
            var levs = data.values; //values["ref"];

            if (produc == 'N0G' || produc == 'N0U' || produc == 'TVX') {
                // velocity - convert from knots (what is provided in the colortable) to m/s (what the radial gates are in)
                for (var i in levs) { levs[i] = levs[i] * 1.944 }
            } else if (produc == 'N0S') {
                // storm relative velocity tweaks
                for (var i in levs) { levs[i] = levs[i] + 0.5 }
            }

            var actualCanvas = document.getElementById('texturecolorbar');
            var visualCanvas = document.getElementById('mapColorScale');

            var width = 1500;
            var height = 1;

            actualCanvas.width = width;
            actualCanvas.height = height;
            visualCanvas.width = $('#mapColorScale').width();
            visualCanvas.height = $('#mapColorScale').height();

            var actualCTX = actualCanvas.getContext('2d');
            var visualCTX = visualCanvas.getContext('2d');

            actualCTX.clearRect(0, 0, actualCanvas.width, actualCanvas.height);
            visualCTX.clearRect(0, 0, visualCanvas.width, visualCanvas.height);

            var actualGradient = actualCTX.createLinearGradient(0, 0, actualCanvas.width, 0);
            var visualGradient = visualCTX.createLinearGradient(0, 0, visualCanvas.width, 0);

            var cmax = levs[levs.length - 1];
            var cmin = levs[0];
            var clen = colors.length;

            var gradColors = '';
            for (var i = 0; i < clen; ++i) {
                actualGradient.addColorStop((levs[i] - cmin) / (cmax - cmin), colors[i]);
                visualGradient.addColorStop((levs[i] - cmin) / (cmax - cmin), colors[i]);

                var curPercent = (((levs[i] - cmin) / (cmax - cmin)) * 100);
                gradColors += `${colors[i]} ${curPercent}%`;
                if (!(i == clen - 1)) { gradColors += ',\n' }
            }
            actualCTX.fillStyle = actualGradient;
            //visualCTX.fillStyle = visualGradient;

            actualCTX.fillRect(0, 0, actualCanvas.width, actualCanvas.height);
            //visualCTX.fillRect(0, 0, visualCanvas.width, visualCanvas.height);

            $('<style>')
                .prop('type', 'text/css')
                .html(`
                #mapColorScale {
                    background: linear-gradient(
                        to right,
                        ${gradColors}
                    );
                }`)
                .appendTo('head');

            const png = new PNG({
                colorType: 2,
                filterType: 4,
                width: width,
                height: height
            });

            var colorsArr = [];
            for (var i in values) {
                var colArr = rgbValToArray(colors[i]);
                colorsArr.push(colArr)
            }
            var chromaScale = chroma.scale(colors).domain(values).mode('lab');

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;

                    //console.log((values[x] - cmin) / (cmax - cmin))
                    var scaledVal = ut.scale(x, 0, width - 1, cmin, cmax);
                    var colorAtVal = chromaScaleToRgbString(chromaScale(scaledVal));
                    var arrayColorAtVal = rgbValToArray(colorAtVal);

                    png.data[i + 0] = arrayColorAtVal[0]; //getRandomInt(0, 255);
                    png.data[i + 1] = arrayColorAtVal[1]; //getRandomInt(0, 255);
                    png.data[i + 2] = arrayColorAtVal[2]; //getRandomInt(0, 255);
                    png.data[i + 3] = 255;
                }
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.canvas.width = png.width;
            ctx.canvas.height = png.height;

            // https://stackoverflow.com/a/16404317
            var imgData = ctx.createImageData(png.width, png.height);

            var ubuf = new Uint8Array(png.data);
            for (var i = 0; i < ubuf.length; i += 4) {
                imgData.data[i] = ubuf[i];   // red
                imgData.data[i + 1] = ubuf[i + 1]; // green
                imgData.data[i + 2] = ubuf[i + 2]; // blue
                imgData.data[i + 3] = ubuf[i + 3]; // alpha
            }

            for (var i = 0; i < imgData.data.length; i = i + 4) {
                var rgb = `rgba(${imgData.data[i]}, ${imgData.data[i + 1]}, ${imgData.data[i + 2]}, ${imgData.data[i + 3]})`;
                //ut.colorLog(rgb, rgb)
            }

            imagedata = imgData;
            imagetexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, imagetexture);
            pageState.imagedata = imagedata;
            pageState.imagetexture = imagetexture;

            // $('#texturecolorbar').clone().appendTo('#mapColorScaleContainer').attr('id', 'mapColorScale');
            // $('#mapColorScale').removeClass('texturecolorbar');
            // $('#mapColorScale').css({
            //     'position': 'absolute',
            //     'z-index': 115,
            //     'bottom': '50px',
            //     'height': '10px',
            //     'width': '100%',
            //     'display': 'block'
            // })
            // // position: absolute;
            // // z-index: 115;
            // // bottom: 50px;
            // // height: 10px;
            // // width: 100%;
            // console.log($('#mapColorScale'))
            //tt.initPaletteTooltip(produc, colortcanvas);
        });
    }

    function dataStore() {
        return {
            positions: null,
            indices: null,
            colors: null
        }
    }

    var pageState = dataStore();

    //var myWorker = new Worker('./polygonTest/generateVerticesRadarDemo.js');
    //myWorker.onmessage = function (oEvent) {
    function finishItUp(data, indices, colors, layer, geojson) {
        //var data = new Float32Array(oEvent.data.data);
        //var indices = new Int32Array(oEvent.data.indices);
        //var colors = new Float32Array(oEvent.data.colors);
        var data = new Float32Array(data);
        var indices = new Int32Array(indices);
        var colors = new Int32Array(colors);
        var returnedGeojson = geojson;//oEvent.data.geojson;
        pageState.positions = data;
        pageState.indices = indices;
        pageState.colors = colors;
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
        // setTimeout(function() {
        //     //$("#dataDiv").trigger("loadGeoJSON");
        //     //$('#dataDiv').data('calcPolygonsData', [url, phi, radarLat, radarLon, radVersion]);
        //     var calcPolygonsData = $('#dataDiv').data('calcPolygonsData');
        //     generateGeoJSON(calcPolygonsData[0], calcPolygonsData[1], calcPolygonsData[2], calcPolygonsData[3], calcPolygonsData[4])
        // }, 500)
    }

    $.getJSON(`./app/radar/products/${produc}.json`, function(data) {
        divider = data.divider;
        values = data.values;
        minMax = [values[0], values[values.length - 1]];
    }).then(function() {
        //compile shaders
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
        var masterGl;
        var layer = {
            id: "baseReflectivity",
            type: "custom",

            onAdd: function (map, gl) {
                masterGl = gl;
                createTexture(gl);

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
                gl.uniform2fv(this.minmaxLocation, minMax)
                gl.uniform1i(this.textureLocation, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, pageState.positions, gl.STATIC_DRAW);
                gl.enableVertexAttribArray(this.positionLocation);
                gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, pageState.colors, gl.STATIC_DRAW);
                gl.enableVertexAttribArray(this.colorLocation);
                gl.vertexAttribPointer(this.colorLocation, 1, type, normalize, stride, offset);

                gl.bindTexture(gl.TEXTURE_2D, pageState.imagetexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pageState.imagedata)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                var primitiveType = gl.TRIANGLES;
                var count = pageState.indices.length;
                gl.drawArrays(primitiveType, offset, pageState.positions.length / 2);

            }//end render
        }

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var vers = JSON.parse(this.responseText).version;

                calcPolys.calcPolygons(
                    settings["base"],
                    settings["phi"],
                    settings["rlat"],
                    settings["rlon"],
                    vers,
                    function(dat) {
                        finishItUp(dat.data, dat.indices, dat.colors, layer)
                    }
                )
                //myWorker.postMessage([
                //    settings["base"],
                //    settings["phi"],
                //    settings["rlat"],
                //    settings["rlon"],
                //    vers
                //]);
            }
        };
        xhttp.open("GET", jsonObj, true);
        xhttp.send();
    })
}

module.exports = drawRadarShape;