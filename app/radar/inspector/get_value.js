const turf = require('@turf/turf');
const format_value = require('./format_value');
const product_colors = require('../colormaps/colormaps');

function beam_height(distance_km, elevation_meters, elevation_angle) {
    var elevation = elevation_meters; // m
    var height = elevation / 1000; // km
    var range = distance_km; // km
    var elevAngle = elevation_angle; // 0.5;
    var earthRadius = 6374; // km

    const radians = Math.PI / 180;

    /*
    * Calculates the beam height MSL (mean sea level (this means above sea level)) in km.
    * Formula taken from https://wx.erau.edu/faculty/mullerb/Wx365/Doppler_formulas/doppler_formulas.pdf
    */
    var beamHeightMSL = Math.sqrt(
        Math.pow(range, 2)
        +
        Math.pow((4/3) * earthRadius + height, 2)
        +
        (2*range)*((4/3) * earthRadius + height)
        *
        Math.sin(elevAngle * radians)
    ) - (4/3) * earthRadius;

    function km_to_kft(km) { return km * 3.28084 }
    function km_to_miles(km) { return km * 1.609 }

    var beamHeightKFT = km_to_kft(beamHeightMSL);
    var beamHeightMI = km_to_miles(beamHeightMSL);

    return beamHeightMI;
}

function readPixels(gl, x, y) {
    var data = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return data;
}

// https://stackoverflow.com/a/73854666/18758797
function getValue(e) {
    const canvas = map.getCanvas();
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');

    if (gl) {
        // canvas width and height is what you see on the screen
        const canvasWidth = parseFloat(canvas.style.width, 10);
        const canvasHeight = parseFloat(canvas.style.height, 10);

        const map_center = map.getCenter();
        var mapCenter = map.project(map_center);
        // e.point.x and y, specifying the horizontal and vertical pixels read from the lower left corner of the screen
        canvasX = mapCenter.x; // e.point.x;
        canvasY = mapCenter.y; // e.point.y;

        // WebGL buffer is larger than canvas, there 
        const bufferX = (gl.drawingBufferWidth / canvasWidth * canvasX).toFixed(0);
        const bufferY = (gl.drawingBufferHeight / canvasHeight * (canvasHeight - canvasY)).toFixed(0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, window.atticData.fb);
        var data = readPixels(gl, bufferX, bufferY);

        const cmin = window.atticData.cmin;
        const cmax = window.atticData.cmax;
        var value, orig_value;
        if (cmin != undefined) {
            [value, orig_value] = format_value.decode_and_format(data, cmin, cmax);
            if (value == null) {
                $('#colorPickerText').hide();
            } else {
                $('#colorPickerText').show();
            }
            $('#colorPickerTextValue').text(value);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var [r, g, b, a] = readPixels(gl, bufferX, bufferY);
        var color = `rgba(${r}, ${g}, ${b}, ${a})`;
        if (color != 'rgba(0, 0, 0, 0)') {
            var color_to_show;
            if (window.atticData.webgl_chroma_scale != undefined) {
                const [r2, g2, b2, a2] = window.atticData.webgl_chroma_scale(parseFloat(orig_value)).rgba();
                color_to_show = `rgba(${r2}, ${g2}, ${b2}, ${a2})`;
            } else {
                color_to_show = color;
            }
            if (value == null) {
                color_to_show = color;
            }
            if (value == 'Range Folded') {
                color_to_show = product_colors.range_folded;
            }
            $('#colorPicker').css('background-color', color_to_show);
        }

        const radar_location = window.atticData.current_nexrad_location;
        if (radar_location != undefined) {
            const map_center_formatted = turf.point([map_center.lng, map_center.lat]);
            const radar_location_formatted = turf.point([radar_location[1], radar_location[0]]);
            const bearing = turf.bearing(map_center_formatted, radar_location_formatted);

            $('#radarCenterLine').css({
                '-webkit-transform': `rotate(${bearing}deg)`,
                '-moz-transform': `rotate(${bearing}deg)`,
                'transform': `rotate(${bearing}deg)` /* For modern browsers(CSS3)  */
            });

            const current_elevation_angle = window.atticData.current_elevation_angle;
            const distance_from_radar = turf.distance(map_center_formatted, radar_location_formatted, { units: 'kilometers' });
            const beam_height_calculated = beam_height(distance_from_radar, radar_location[2], current_elevation_angle);
            $('#colorPickerTextBeamHeight').text(`${beam_height_calculated.toFixed(1)} mi`)
        }
    }
}

module.exports = getValue;