const product_colors = require('../colormaps/colormaps');
const ut = require('../../core/utils')
const map_funcs = require('../../core/map/mapFunctions');
// const initStormTracks = require('../level3/stormTracking/fetchData');
const init_storm_tracks = require('../libnexrad_helpers/level3/storm_tracks/init_storm_tracks');
const setLayerOrder = require('../../core/map/setLayerOrder');
const create_and_show_colorbar = require('./create_and_show_colorbar');
const create_WebGL_texture = require('./create_WebGL_texture');
const vertex_source = require('./glsl/vertex.glsl');
const fragment_source = require('./glsl/fragment.glsl');
const fragment_framebuffer_source = require('./glsl/fragment_framebuffer.glsl');
const map = require('../../core/map/map');
const RadarUpdater = require('../updater/RadarUpdater');
const filter_lightning = require('../../lightning/filter_lightning');
const load_lightning = require('../../lightning/load_lightning');
const turf = require('@turf/turf');
const CheapRuler = require('cheap-ruler');

function plot_to_map(verticies_arr, colors_arr, product, nexrad_factory) {
    var color_scale_data = product_colors[product];
    var colors = [...color_scale_data.colors];
    var values = [...color_scale_data.values];

    const location = nexrad_factory.get_location();
    const radar_lat_lng = { lat: location[0], lng: location[1] }

    // add range folded colors
    if (color_scale_data.hasOwnProperty('range_fold')) {
        colors.push(color_scale_data.range_fold);
        values.push(product_colors.range_folded_val);
    }

    values = ut.scaleValues(values, product);
    const cmin = values[0];
    window.atticData.cmin = cmin;
    window.atticData.colorscale_cmin = cmin;
    const cmax = values[values.length - 1];
    window.atticData.cmax = cmax;
    window.atticData.colorscale_cmax = cmax;
    if (color_scale_data.hasOwnProperty('range_fold')) {
        const colorscale_cmax = values[values.length - 2];
        window.atticData.colorscale_cmax = colorscale_cmax;
    }

    //var vertexF32 = new Float32Array(verticiesArr);
    //var colorF32 = new Float32Array(colorsArr);
    var vertexF32 = verticies_arr;
    var colorF32 = colors_arr;

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
        gl.uniform2fv(this.radarLngLatLocationFramebuffer, [radar_lat_lng.lat, radar_lat_lng.lng]);
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
            create_and_show_colorbar(colors, values);
            // create the color scale texture
            imagedata = create_WebGL_texture(colors, values);
            imagetexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, imagetexture);

            // compile the vertex shader
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertex_source);
            gl.compileShader(vertexShader);

            // compile the main fragment shader
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragment_source);
            gl.compileShader(fragmentShader);

            // compile the framebuffer fragment shader
            var fragmentShaderFramebuffer = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShaderFramebuffer, fragment_framebuffer_source);
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
            this.radarLngLatLocation = gl.getUniformLocation(this.program, 'radar_lat_lng');

            // retrieve the framebuffer program's uniforms
            this.matrixLocationFramebuffer = gl.getUniformLocation(this.programFramebuffer, 'u_matrix');
            this.minmaxLocationFramebuffer = gl.getUniformLocation(this.programFramebuffer, 'minmax');
            this.radarLngLatLocationFramebuffer = gl.getUniformLocation(this.programFramebuffer, 'radar_lat_lng');

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
            // function splitDouble(dbl) {
            //     function doubleToFloat(d) { return new Float32Array([d])[0] }
            //     var arr = new Float32Array(2);
            //     arr[0] = doubleToFloat(dbl);
            //     arr[1] = doubleToFloat(dbl - arr[0]);
            //     return arr;
            // }
            // var highMatrix = [];
            // var lowMatrix = [];
            // for (var i in matrix) {
            //     var split = splitDouble(matrix[i]);
            //     highMatrix.push(split[0]);
            //     lowMatrix.push(split[1]);
            // }

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
            if ($('#colorPickerItemClass').hasClass('menu_item_selected')) {
                renderToFramebuffer.apply(this, [gl, matrix]);
            }

            /*
            * use the main program to render to the map
            */
            gl.useProgram(this.program);

            // set uniforms for the main shaders
            gl.uniformMatrix4fv(this.matrixLocation, false, matrix);
            gl.uniform2fv(this.radarLngLatLocation, [radar_lat_lng.lat, radar_lat_lng.lng]);
            gl.uniform2fv(this.minmaxLocation, [cmin, cmax]);
            gl.uniform1i(this.textureLocation, 0);

            // draw vertices
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.drawArrays(gl.TRIANGLES, 0, vertexF32.length / 2);
        }
    }

    map_funcs.removeMapLayer('baseReflectivity');
    map.addLayer(layer, map_funcs.get_base_layer());

    var isInFileUploadMode = window.atticData.from_file_upload; /* $('#armrModeBtnSwitchElem').is(':checked'); */
    if (!isInFileUploadMode) {
        init_storm_tracks.fetch_data();
        // STstuff.loadAllStormTrackingStuff();

        function _after() {
            filter_lightning();
            const isLightningVisChecked = $('#armrLightningVisBtnSwitchElem').is(':checked');
            if (!isLightningVisChecked) {
                if (map.getLayer('lightningLayer')) {
                    map.setLayoutProperty('lightningLayer', 'visibility', 'none');
                }
            }
        }
        if (!map.getLayer('lightningLayer')) {
            load_lightning(() => {
                _after();
            });
        } else {
            _after();
        }
    } else {
        filter_lightning(true);
    }

    const range = nexrad_factory?.initial_radar_obj?.max_range;
    if (range != undefined) {
        const location = nexrad_factory.get_location();
        // const range_circle = turf.circle([location[1], location[0]], range, { steps: 100, units: 'kilometers' });

        // CheapRuler is better than turf because it's used to calculate the radar data anyways
        var ruler = new CheapRuler(location[0], 'kilometers');
        const center = [location[1], location[0]];
        const radius = range;
        const segments = 500;
        const points = [];
        for (let i = 0; i < segments; i++) {
            const angle = (360 / segments) * i; // Calculate the angle for each segment
            const point = ruler.destination(center, radius, angle); // Calculate the point on the circle
            points.push(point);
        }
        points.push(points[0]);
        const range_circle = turf.polygon([points]);

        if (map.getSource('station_range_source')) {
            map.getSource('station_range_source').setData(range_circle);
        } else {
            map.addSource('station_range_source', {
                type: 'geojson',
                data: range_circle
            })
            map.addLayer({
                'id': 'station_range_layer',
                'type': 'line',
                'source': 'station_range_source',
                'paint': {
                    'line-color': '#999999',
                    'line-width': 0.25
                }
            });
        }
    }

    // make sure the alerts are always on top
    setLayerOrder();

    var isRadarVisChecked = $('#armrRadarVisBtnSwitchElem').is(':checked');
    if (!isRadarVisChecked) {
        map.setLayoutProperty('baseReflectivity', 'visibility', 'none');
        map.setLayoutProperty('station_range_layer', 'visibility', 'none');
    }

    if (isInFileUploadMode) {
        if (nexrad_factory.nexrad_level == 2) {
            const file_id = nexrad_factory.generate_unique_id();
            if (window.atticData.L2_file_id_zoomed_yet != file_id) { // if we're on a new file
                window.atticData.L2_file_id_zoomed_yet = file_id; // set the new id globally
                nexrad_factory.fly_to_location();
            }
        } else {
            nexrad_factory.fly_to_location();
        }
    }

    if (window?.atticData?.current_RadarUpdater != undefined) {
        window.atticData.current_RadarUpdater.disable();
    }
    if (!isInFileUploadMode) {
        const current_RadarUpdater = new RadarUpdater(nexrad_factory);
        window.atticData.current_RadarUpdater = current_RadarUpdater;
        current_RadarUpdater.enable();
    }

    window.atticData.current_nexrad_location = nexrad_factory.get_location();
    window.atticData.current_elevation_angle = nexrad_factory.elevation_angle;
}

module.exports = plot_to_map;