const calcPolys = require('./calculatePolygons');
const STstuff = require('../level3/stormTracking/stormTrackingMain');
const tt = require('../misc/paletteTooltip');
const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');
var map = require('../map/map');

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
    function createTexture(gl) {
        $.getJSON(`./app/radar/products/${produc}.json`, function(data) {
            //console.log(data);
            var colors = data.colors; //colors["ref"];
            var levs = data.values; //values["ref"];
            var colortcanvas = document.getElementById("texturecolorbar");
            colortcanvas.width = 300;
            colortcanvas.height = 30;
            var ctxt = colortcanvas.getContext('2d');
            ctxt.clearRect(0, 0, colortcanvas.width, colortcanvas.height);
            var grdt = ctxt.createLinearGradient(0, 0, colortcanvas.width, 0);
            var cmax = levs[levs.length - 1];
            var cmin = levs[0];
            var clen = colors.length;

            for (var i = 0; i < clen; ++i) {
                grdt.addColorStop((levs[i] - cmin) / (cmax - cmin), colors[i]);
            }
            ctxt.fillStyle = grdt;
            ctxt.fillRect(0, 0, colortcanvas.width, colortcanvas.height);
            imagedata = ctxt.getImageData(0, 0, colortcanvas.width, colortcanvas.height);
            imagetexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, imagetexture);
            pageState.imagedata = imagedata;
            pageState.imagetexture = imagetexture;
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagedata)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            tt.initPaletteTooltip(produc, colortcanvas);
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

        const layers = map.getStyle().layers;
        var allRoadLayers = [];
        for (const layer of layers) {
            //console.log(layer.id)
            if (layer.type === 'symbol'/* || layer.type === 'line'*/) {
                allRoadLayers.push(layer.id);
            }
        }

        // road-minor-low
        // road-street-low
        // road-minor-case
        // road-street-case
        // road-secondary-tertiary-case
        // road-primary-case
        // road-major-link-case
        // road-motorway-trunk-case
        // road-construction
        // road-path
        // road-steps
        // road-major-link
        // road-pedestrian
        // road-minor
        // road-street
        // road-secondary-tertiary
        // road-primary
        // road-motorway-trunk
        // road-rail

        map.addLayer(layer);
        for (item in allRoadLayers) {
            mapFuncs.moveMapLayer(allRoadLayers[item])
        }

        document.getElementById('spinnerParent').style.display = 'none';

        // load the visibility button
        require('../map/controls/visibility');

        // load the refresh button
        // require('./refresh');

        if ($('#dataDiv').data('fromFileUpload')) {
            ut.flyToStation();
        } else {
            STstuff.loadAllStormTrackingStuff();
        }

        // make sure the alerts are always on top
        mapFuncs.moveMapLayer('newAlertsLayer');
        mapFuncs.moveMapLayer('newAlertsLayerOutline');

        var dividedArr = ut.getDividedArray(ut.progressBarVal('getRemaining'));

        console.log('File plotting complete');
        ut.betterProgressBar('set', 100);
        ut.betterProgressBar('hide');
    }

    $.getJSON(`./app/radar/products/${produc}.json`, function(data) {
        divider = data.divider;
    }).then(function() {
        //console.log('NEW!!!!')
        //console.log(divider)
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
                gl_Position = u_matrix * vec4(aPosition.x,aPosition.y,0.0,1.0);
            }`;
        var fragmentSource = `
            precision mediump float;
            varying float color;
            uniform sampler2D u_texture;
            void main() {
                //gl_FragColor = vec4(0.0,color/60.0,0.0,1.0);
                float calcolor = (color)${divider};
                gl_FragColor = texture2D(u_texture,vec2(min(max(calcolor,0.0),1.0),0.0));
                //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
            }`
        var masterGl;
        var layer = {
            id: "baseReflectivity",
            type: "custom",
            minzoom: 0,
            maxzoom: 18,

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