const get_nexrad_location = require('../nexrad_locations').get_nexrad_location;
const calculate_coordinates = require('../../plot/calculate_coordinates');
const display_file_info = require('../../libnexrad_helpers/display_file_info');
const elevation_menu = require('../../libnexrad_helpers/level2/elevation_menu');
const dealias = require('../../libnexrad_helpers/level2/dealias/dealias');
const map = require('../../../core/map/map');
const plot_to_map = require('../../plot/plot_to_map');
const work = require('webworkify');

// https://stackoverflow.com/a/8043061
function _zero_pad(num) {
    const formatted_number = num.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    })
    return formatted_number;
}

/**
 * A class that provides simple access to the radar data returned from the 'NEXRADLevel2File' class.
 * It sorts the radar sweeps by elevation, and provides several functions that assist with retrieving specific bits of data.
 */
class Level2Factory {
    constructor (initial_radar_obj) {
        this.initial_radar_obj = initial_radar_obj;

        this.nexrad_level = 2;
        this.filename = initial_radar_obj.filename;

        this.header = initial_radar_obj.volume_header;
        this.vcp = initial_radar_obj.vcp;
        this.nscans = this.initial_radar_obj.nscans;
        this.vcp = this.get_vcp();

        this.dealias_data = {};
        this._wasm_loaded = false;

        this.station = this.header.icao;
        const station_remove_irregular = this.station.replaceAll('\u0000', '').trim();
        if (station_remove_irregular == '') {
            const station_from_filename = this.filename.substring(0, 4);
            this.station = station_from_filename;
            this.header.icao = station_from_filename;
        }

        this._group_and_sort_sweeps();
        this.elevation_angle = this.get_elevation_angle(1);
        this.elevation_number = 1;
    }

    /**
     * Get the gate values for a given moment and elevation number.
     * 
     * @param {*} moment The moment being requested. Can be one of the following: 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP'
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @param {Boolean} retrieve_dealiased Whether or not to return the dealiased data.
     * @returns {Array} A 2D array, with each sub-array being an array of its corresponding radial's data.
     */
    get_data(moment, elevation_number, retrieve_dealiased) {
        var key = 'data';
        if (retrieve_dealiased == undefined) { retrieve_dealiased = false }
        if (retrieve_dealiased) { key = 'dealiased_data' }
        var data = this.get_value_from_sweep(key, moment, elevation_number);
        if (retrieve_dealiased) {
            return data;
        }

        var prod_hdr = this.grouped_sweeps[elevation_number][0][moment];
        var offset = prod_hdr.offset;
        var scale = prod_hdr.scale;

        var scaleFunction = function(x) {
            if (x <= 1) { return null; }
            else { return (x - offset) / scale; }
        };
        data = this._scale_values(data, scaleFunction);

        return data;
    }

    /**
     * Get the azimuth angles for a given moment and elevation number.
     * 
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Array} An array, containing all of the azimuth angles for each radial in the sweep.
     */
    get_azimuth_angles(elevation_number) {
        var azimuths = this.get_value_from_sweep('azimuth_angle', 'msg_header', elevation_number);

        var msg_type = this.initial_radar_obj.msg_type;
        var scale;
        if (msg_type == '1') {
            scale = 180 / (4096 * 8);
        } else {
            scale = 1;
        }

        var scaleFunction = function(x) { return x * scale; };
        azimuths = this._scale_values(azimuths, scaleFunction);

        // adjust the azimuth values
        azimuths = this._adjust_azimuths(azimuths);
        return azimuths;
    }

    /**
     * Get the ranges (distances) from the radar, for each gate along a radial at any azimuth.
     * 
     * @param {*} moment The moment being requested. Can be one of the following: 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP'
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Array} An array, containing all of the ranges for any azimuth in the sweep.
     */
    get_ranges(moment, elevation_number) {
        var prod_hdr = this.grouped_sweeps[elevation_number][0][moment];
        var gate_count = prod_hdr.ngates;
        var gate_size = prod_hdr.gate_spacing / 1000;
        var first_gate = prod_hdr.first_gate / 1000;
        // level 2 = 1832 0.25 2.125
        var prod_range = [...Array(gate_count + 1).keys()];
        for (var i in prod_range) {
            prod_range[i] = (prod_range[i] - 0.5) * gate_size + first_gate;
        }
        return prod_range;
    }

    /**
     * Gets a specific value in a moment for each radial in a sweep. This can be useful when gathering data that varies across all radials.
     * 
     * @param {String} key The key to look for in the requested moment's object.
     * @param {String} moment The moment being requested. Can be one of the following: 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP', 'ELV', 'RAD', 'VOL', 'header', 'msg_header'
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Array} An array, containing the requested values for each radial in a sweep.
     */
    get_value_from_sweep(key, moment, elevation_number) {
        var output = [];
        var curSweep = this.grouped_sweeps[elevation_number];
        for (var i in curSweep) {
            var curRecord = curSweep[i];
            if (curRecord.hasOwnProperty(moment)) {
                var data = curRecord[moment][key];
                if (key == 'data') {
                    data = Array.from(data);
                }
                output.push(data);
            }
        }
        return output;
    }

    /**
     * Retrieves the radar's coordinates and altitude, by first searching a radial record, and if that fails, by looking up the radar's ICAO.
     * 
     * @param {String} station (optional) The four-letter ICAO of a radar station. If passed, the function will return the coordinates of that station.
     * This is useful for older AR2V files where the location data is not included.
     * @returns {Array} An array in the format [latitude, longitude, altitude (in meters)]. Will return [0, 0, 0] if the radar's location could not be determined.
     */
    get_location(station = null) {
        var lat, lng, alt;

        if (station != null) {
            [lat, lng, alt] = get_nexrad_location(station);
            return [lat, lng, alt];
        }
        var msg_type = this.initial_radar_obj.msg_type;
        if (msg_type == '1') {
            if (this.header.hasOwnProperty('icao')) {
                [lat, lng, alt] = get_nexrad_location(this.header['icao']);
            } else {
                return [0, 0, 0];
            }
        } else {
            if (this.initial_radar_obj.radial_records[0].hasOwnProperty('VOL')) {
                var dic = this.initial_radar_obj.radial_records[0]['VOL'];
                var height = dic['height'] + dic['feedhorn_height'];
                [lat, lng, alt] = [dic['lat'], dic['lon'], height];
            } else if (this.header.hasOwnProperty('icao')) {
                [lat, lng, alt] = get_nexrad_location(this.header['icao']);
            } else {
                return [0, 0, 0];
            }
        }

        return [lat, lng, alt];
    }

    /**
     * Scales an elevation angle value by the standard set in the ICD.
     * 
     * @param {Number} elevation_angle The unscaled elevation number.
     */
    _scale_elevation_angle(elevation_angle) {
        var scaled_elev_angle = elevation_angle * (180 / (4096 * 8));
        if (scaled_elev_angle >= 50) {
            scaled_elev_angle = scaled_elev_angle - 360;
        }
        return scaled_elev_angle;
    }
    /**
     * Get the elevation angle for a given elevation number.
     * 
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     */
    get_elevation_angle(elevation_number) {
        var msg_type = this.initial_radar_obj.msg_type;
        var elev_angle;
        if (msg_type == '1') {
            elev_angle = this.get_value_from_sweep('elevation_angle', 'msg_header', elevation_number)[0];
        } else {
            elev_angle = this.initial_radar_obj.vcp.cut_parameters[elevation_number - 1].elevation_angle;
        }

        return this._scale_elevation_angle(elev_angle);
    }

    /**
     * Gets the date at which the radar volume was collected.
     * If an elevation number is passed, the date for that sweep is returned.
     * If nothing is passed, the date for the whole volume is returned.
     * 
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Date} A Date object that contains the radar volume's time.
     */
    get_date(elevation_number = null) {
        var modifiedJulianDate, milliseconds;

        if (elevation_number == null) {
            modifiedJulianDate = this.header.date;
            milliseconds = this.header.time;
        } else {
            // the date & time for the first radial in a sweep. each radial has its own date,
            // but we'll only use the first one, representing the start of the sweep.
            var sweepHeader = this.grouped_sweeps[elevation_number][0].header;
            modifiedJulianDate = sweepHeader.date;
            milliseconds = sweepHeader.ms;
        }

        if (this.station == 'KULM' || this.station == 'WILU' || this.station == 'FWLX') {
            modifiedJulianDate = this.grouped_sweeps[1][0].header.date;
        }

        return this._julian_and_millis_to_date(modifiedJulianDate, milliseconds);
    }

    /**
     * Finds the numerical VCP (volume coverage pattern) of the radar file. Returns 'null' if it could not be found.
     * 
     * @returns {Number} The VCP of the radar file.
     */
    get_vcp() {
        var volMomentVCP = this?.initial_radar_obj?.radial_records?.[0]?.['VOL']?.vcp;
        var msg_headerMomentVCP = this?.initial_radar_obj?.radial_records?.[0]?.['msg_header']?.vcp;
        var headerVCP = this?.vcp?.['msg5_header']?.['pattern_number'];

        if (headerVCP == 0) {
            return volMomentVCP ??
                msg_headerMomentVCP ??
                null;
        } else {
            return headerVCP ??
                volMomentVCP ??
                msg_headerMomentVCP ??
                null;
        }
    }

    /**
     * Function that plots the factory with its radar data to the map.
     * 
     * @param {*} moment The moment being requested. Can be one of the following: 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP'
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     */
    plot(moment, elevation_number) {
        this.elevation_angle = this.get_elevation_angle(elevation_number);
        this.elevation_number = elevation_number;

        // we don't want to load the elevation menu multiple times for the same radar file
        const file_id = this.generate_unique_id();
        if (window.atticData.L2_file_id != file_id) { // if we're on a new file
            window.atticData.L2_file_id = file_id; // set the new id globally
            elevation_menu.apply(this, [this.list_elevations_and_products()]); // load the elevation menu
        }

        this.display_file_info();
        const options = {'product': moment, 'elevation': elevation_number};

        window.atticData.nexrad_factory_moment = moment
        window.atticData.nexrad_factory_elevation_number = elevation_number;
        window.atticData.nexrad_factory = this;

        calculate_coordinates(this, options);
    }

    /**
     * Function that writes the necessary file information to the DOM.
     */
    display_file_info() {
        // execute code from another file
        display_file_info.apply(this);
    }

    /**
     * Function that loops over every sweep, and stores information about the sweep in an array.
     * This is useful for creating buttons in the DOM. Often abbreviated "lEAP".
     * 
     * @returns {Array} An array with sorted information about each sweep. Formatted as such:
     * [elevation angle, elevation number, moments in the elevation, waveform type]
     */
    list_elevations_and_products() {
        var elevation_angle;
		var elev_angle_arr = [];
        if (this.initial_radar_obj.msg_type == '31') {
            for (var key = 0; key < this.initial_radar_obj.vcp.cut_parameters.length; key++) {
                try {
                    var elevations_base = this.initial_radar_obj.vcp.cut_parameters[key];
                    var product_base = this.grouped_sweeps[key + 1][0];

                    var all_products_arr = [];
                    ['REF', 'VEL', 'RHO', 'PHI', 'ZDR', 'SW'].forEach(prop => {
                        if (product_base.hasOwnProperty(prop)) {
                            all_products_arr.push(prop);
                        }
                    });

                    elevation_angle = this._scale_elevation_angle(elevations_base.elevation_angle);
                    elev_angle_arr.push([
                        elevation_angle,
                        (key + 1).toString(),
                        all_products_arr,
                        elevations_base.waveform_type
                    ]);
                } catch (e) {
                    console.warn(`Warning on elevation ${elevation_angle}: ${e}`);
                }
            }
        } else if (this.initial_radar_obj.msg_type == '1') {
            for (var key = 1; key < this.grouped_sweeps.length; key++) {
                try {
                    var elevations_base = this.grouped_sweeps[key][0].msg_header;
                    var product_base = this.grouped_sweeps[key][0];

                    var all_products_arr = [];
                    ['REF', 'VEL', 'RHO', 'PHI', 'ZDR', 'SW'].forEach(prop => {
                        if (product_base.hasOwnProperty(prop)) {
                            all_products_arr.push(prop);
                        }
                    });

                    elevation_angle = this._scale_elevation_angle(elevations_base.elevation_angle);
                    elev_angle_arr.push([
                        elevation_angle,
                        key.toString(),
                        all_products_arr,
                        null
                    ]);
                } catch (e) {
                    console.warn(`Warning on elevation ${elevation_angle}: ${e}`);
                }
            }
        }
        return elev_angle_arr;
    }

    /**
     * Function that returns an array with the product abbreviations of all of the products contained in the radar file
     * 
     * @returns {Array} An array with all of the radar file's moments
     */
	get_all_products() {
		var lEAP = this.list_elevations_and_products();

		var all_products = [];
		for (var i in lEAP) {
			var products = lEAP[i][2];
			for (var n in products) {
				if (!all_products.includes(products[n])) {
					all_products.push(products[n]);
				}
			}
		}

		return all_products;
	}

    /**
     * Generates a unique ID associated with the file.
     * 
     * @returns {String} A string with the file's ID.
     */
    generate_unique_id() {
        const station = this.station;
        const date = this.get_date();
        const year = date.getUTCFullYear();
        const month = _zero_pad(date.getUTCMonth() + 1);
        const day = _zero_pad(date.getUTCDate());
        const hour = _zero_pad(date.getUTCHours());
        const minute = _zero_pad(date.getUTCMinutes());
        const second = _zero_pad(date.getUTCSeconds());

        const formatted_string = `${station}${year}${month}${day}_${hour}${minute}${second}`;
        return formatted_string;
    }

    /**
     * Zooms and pans the map to the radar's location.
     */
    fly_to_location() {
        const location = this.get_location();
        map.flyTo({ center: [location[1], location[0]], zoom: 6.5, speed: 1.75, essential: true });
    }

    /**
     * Returns the nyquist velocity for a given sweep.
     * 
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Number} The nyquist velocity.
     */
    get_nyquist_vel(elevation_number) {
        var nyquist; 
        if (this.initial_radar_obj.msg_type == '31') {
            nyquist = this.grouped_sweeps[elevation_number][0].RAD.nyquist_vel;
        } else if (this.initial_radar_obj.msg_type == '1') {
            nyquist = this.grouped_sweeps[elevation_number][0].msg_header.nyquist_vel;
        }
        return nyquist / 100;
    }

    /**
     * Dealiases the velocity data for a given sweep.
     * The data is outputted to the "dealiased_data" key for the "VEL" moment in the sweep.
     * 
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     */
    dealias(elevation_number) {
        const nyquist = this.get_nyquist_vel(elevation_number);
        const velocities = this.get_data('VEL', elevation_number);
        const dealiased_velocities = dealias(velocities, nyquist);

        for (var i = 0; i < this.grouped_sweeps[elevation_number].length; i++) {
            this.grouped_sweeps[elevation_number][i].VEL.dealiased_data = dealiased_velocities[i];
        }
    }

    /**
     * Checks whether or not a given sweep has been dealiased yet.
     * 
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Boolean} Whether or not the sweep has been dealiased yet.
     */
    check_if_already_dealiased(elevation_number) {
        if (this.grouped_sweeps[elevation_number][0]?.VEL?.dealiased_data == undefined) {
            // we HAVEN'T dealiased yet
            return false;
        } else {
            // we HAVE dealiased
            return true;
        }
    }

    /**
     * Dealiases a radar sweep using an algorithm that works well on tornadic signatures.
     * It automatically plots the dealiased data to the map.
     * 
     * @param {Number} elevation_number A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @param {Function} callback A callback function to execute after the map plotting has completed.
     */
    dealias_alt_and_plot(elevation_number, callback) {
        const thisobj = this;

        const already_dealiased = this.dealias_data[elevation_number];
        if (already_dealiased != undefined) {
            plot_to_map(new Float32Array(already_dealiased.points), new Float32Array(already_dealiased.values), 'VEL', this);
            callback();
        } else {
            const buffer = this.initial_radar_obj.buffer.slice(0); // copy the buffer

            if (this._wasm_worker == undefined) {
                const worker = new Worker('./app/radar/libnexrad/level2/wasm/dealias_worker.js');
                this._wasm_worker = worker;
            }

            function _init() {
                thisobj._wasm_loaded = true;
                thisobj._wasm_worker.postMessage({ message: "checkExists", name: thisobj.generate_unique_id()});
            }

            if (this._wasm_loaded) {
                _init();
            }

            thisobj._wasm_worker.onmessage = (event) => {
                // console.log(event.data);

                if (event.data == 'loaded') {
                    _init();
                }

                if (event.data.action == 'doesExist') {
                    // thisobj._wasm_worker.postMessage({ message: "deleteFile", fileNum: 0 });
                    thisobj._wasm_worker.postMessage({ message: "dealiasVelocity", data: { fileNum: 0, idx: elevation_number, field: 255 } });
                }
                if (event.data.action == 'doesNotExist') {
                    thisobj._wasm_worker.postMessage({ message: "initialize", fileName: thisobj.generate_unique_id(), buffer: buffer }, [buffer]);
                    thisobj._wasm_worker.postMessage({ message: "dealiasVelocity", data: { fileNum: 0, idx: elevation_number, field: 255 } });
                }

                if (event.data.action == 'loadDataDealias') {
                    const f32 = event.data.data.float;
                    const array = Array.from(f32);

                    const location = thisobj.get_location();

                    const values = [];
                    var points = [];
                    for (var i = 0; i < array.length; i += 3) {
                        const x = array[i];
                        const y = array[i + 1];

                        points.push(x);
                        points.push(y);
                        values.push(array[i + 2] / 1.944);
                    }
                    points = new Float32Array(points);

                    var w = work(require('./wasm/correction_worker'));
                    w.addEventListener('message', function (ev) {
                        if (thisobj.dealias_data[elevation_number] == undefined) {
                            thisobj.dealias_data[elevation_number] = { points: ev.data, values: values }
                        }

                        plot_to_map(ev.data, new Float32Array(values), 'VEL', thisobj);
                        callback();
                    })
                    w.postMessage([points, location], [points.buffer]);
                }
            }
        }
    }

    /**
     * Helper function that converts a modified julian date (MJD) and milliseconds to a JavaScript Date object.
     * 
     * @param {Number} modifiedJulianDate A Number representing the modified julian date.
     * @param {Number} milliseconds A Number representing the number of milliseconds.
     * e.g. 0 ms = 00:00 UTC, 82800000 ms == 23:00 UTC
     * @returns {Date} The two input values converted to a Date object.
     */
    _julian_and_millis_to_date(modifiedJulianDate, milliseconds) {
        // page 14 - https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620001Y.pdf
        // page 16 - https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf
        var julianDate = modifiedJulianDate + 2440586.5;
        // https://stackoverflow.com/a/36073807
        var millis = (julianDate - 2440587.5) * 86400000;

        var fileDateObj = new Date(millis);
        var fileHours = msToTime(milliseconds).hours;
        var fileMinutes = msToTime(milliseconds).minutes;
        var fileSeconds = msToTime(milliseconds).seconds;
        fileDateObj.setUTCHours(fileHours);
        fileDateObj.setUTCMinutes(fileMinutes);
        fileDateObj.setUTCSeconds(fileSeconds);

        return fileDateObj;
    }

    /**
     * Helper function that scales all of the values in an input array to the desired size. This is useful when converting NEXRAD binary data from its stored format to its readable format, as defined in the ICD.
     * 
     * @param {*} inputValues A 1D or 2D array containing values you wish to scale.
     * @param {Function} scaleFunction The function to perform on every value. For example, passing 'function(x) { return x * 2 }' will double each element in the array.
     * @returns {Array} An array in the same shape as the original, but with the values scaled.
     */
    _scale_values(inputValues, scaleFunction) {
        for (var i in inputValues) {
            if (Array.isArray(inputValues[i])) { // this check allows for the scaling of 2D arrays
                inputValues[i] = inputValues[i].map(i => scaleFunction(i)); // perform the scaling function on every sub-element
            } else {
                inputValues[i] = scaleFunction(inputValues[i]);
            }
        }
        return inputValues;
    }

    /**
     * Helper function that performs some adjustments on the azimuth values.
     * Taken from the example at:
     * https://unidata.github.io/MetPy/latest/examples/formats/NEXRAD_Level_2_File.html
     * 
     * @param {Array} azimuths An array of azimuth values to adjust.
     * @returns {Array} An array with the corrected azimuth values.
     */
    _adjust_azimuths(azimuths) {
        var diff = azimuths.slice(1).map((val, index) => val - azimuths[index]);
        var crossed = diff.map(i => i < -180);
        diff = diff.map((val, index) => crossed[index] ? val + 360 : val);
        var avg_spacing = diff.reduce((a, b) => a + b) / diff.length;

        // Convert mid-point to edge
        azimuths = azimuths.slice(0, -1).map((val, index) => (val + azimuths[index + 1]) / 2);
        azimuths = azimuths.map((val, index) => crossed[index] ? val + 180 : val);

        // Concatenate with overall start and end of data we calculate using the average spacing
        azimuths = [azimuths[0] - avg_spacing].concat(azimuths, [azimuths[azimuths.length - 1] + avg_spacing]);
        return azimuths;
    }

    /**
     * Helper function that groups all of the
     * radial records found in the file by their elevation number.
     * 
     * Creates a new array in the Level2Factory class called 'grouped_sweeps'.
     */
    _group_and_sort_sweeps() {
        var grouped = [];
        var scan_msgs = this.initial_radar_obj.scan_msgs; // the 2d array that stores the index of each radial record for each elevation
        var radial_records = this.initial_radar_obj.radial_records; // the array that stores all radial records from the file
        for (var i = 0; i < scan_msgs.length; i++) { // loop through all of the scan messages indices
            var curElevNum = i + 1; // elevation numbers are 1-based, while JS array indices are 0-based
            var curSweep = scan_msgs[i]; // pull the scan messages for the current sweep
            for (var n in curSweep) { // loop through the current sweep's scan messages (a 1d array of indices)
                var radialRecordNumber = curSweep[n]; // the current scan message index
                var cur_radial_record = radial_records[radialRecordNumber]; // pull the relevant radial record pertaining to the current scan message index

                if (grouped[curElevNum] == undefined) { // create a sub-array in the output array if it doesn't exist
                    grouped[curElevNum] = [];
                }
                grouped[curElevNum].push(cur_radial_record); // push the current radial record to its correct position
            }
        }
        this.grouped_sweeps = grouped;
    }
}

function msToTime(s) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return {
        'hours': pad(hrs),
        'minutes': pad(mins),
        'seconds': pad(secs),
        'milliseconds': pad(ms, 3),
    }
    // return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

module.exports = Level2Factory;