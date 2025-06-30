const get_nexrad_location = require('../nexrad_locations').get_nexrad_location;
const nexrad_locations = require('../nexrad_locations').NEXRAD_LOCATIONS;
const nexrad_station_abbreviations = require('../nexrad_station_abbreviations');
const level3_formatters = require('./level3_formatters');
const calculate_coordinates = require('../../plot/calculate_coordinates');
const display_file_info = require('../../libnexrad_helpers/display_file_info');
const { get_date_diff_obj } = require('../../../core/misc/get_date_diff');
const luxon = require('luxon');
const ut = require('../../../core/utils');

const plot_storm_tracks = require('../../libnexrad_helpers/level3/storm_tracks/plot_storm_tracks');
const plot_tornado_vortex_signature = require('../../libnexrad_helpers/level3/storm_tracks/plot_tornado_vortex_signature');

// https://stackoverflow.com/a/8043061
function _zero_pad(num) {
    const formatted_number = num.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    })
    return formatted_number;
}

/**
 * A class that provides simple access to the radar data returned from the 'NEXRADLevel3File' class.
 */
class Level3Factory {
    constructor(initial_radar_obj) {
        this.initial_radar_obj = initial_radar_obj;

        this.nexrad_level = 3;

        this.header = initial_radar_obj.header;
        this.vcp = initial_radar_obj.prod_desc.vcp;
        this.product_code = this.header.code;
        this.product_abbv = initial_radar_obj.product_abbv;
        this.station = nexrad_station_abbreviations[this.initial_radar_obj.siteID];
        this.elevation_angle = this.get_elevation_angle();
        this.scaled = false;

        const tab_pages = this.initial_radar_obj?.tab_pages;
        const graph_pages = this.initial_radar_obj?.graph_pages;
        if (this.product_code == 58) {
            // storm tracks
            this.formatted_tabular = level3_formatters.format_storm_tracks(tab_pages, graph_pages);
        } else if (this.product_code == 59) {
            // hail index
            this.formatted_tabular = level3_formatters.format_hail_index(tab_pages);
        } else if (this.product_code == 61) {
            // tornado vortex signature
            this.formatted_tabular = level3_formatters.format_tornado_vortex_signature(tab_pages);
        } else if (this.product_code == 141) {
            // mesocyclone detection
            this.formatted_tabular = level3_formatters.format_mesocyclone_detection(tab_pages);
        }
    }
    /**
     * Get the gate values in the Level 3 file. Returns the scaled values, as documented per the ICD.
     * 
     * @returns {Array} A 2D array, with each sub-array being an array of its corresponding radial's data.
     */
    get_data() {
        var data = this.initial_radar_obj.sym_block[0][0].data;

        if (!this.scaled) {
            data = this._scale_values(data);
        }

        return data;
    }
    /**
     * Get the azimuth angles in the Level 3 file.
     * 
     * @returns {Array} An array, containing all of the azimuth angles for each radial in the sweep.
     */
    get_azimuth_angles() {
        var start_az = this.initial_radar_obj.sym_block[0][0].start_az;
        var end_az = this.initial_radar_obj.sym_block[0][0].end_az;
        var azimuths = start_az.concat([end_az[end_az.length - 1]]);
        return azimuths;
    }
    /**
     * Get the ranges (distances) from the radar, for each gate along a radial at any azimuth.
     * 
     * @returns {Array} An array, containing all of the ranges for any azimuth in the sweep.
     */
    get_ranges() {
        var num_bins = this.initial_radar_obj.sym_block[0][0].num_bins;
        var gate_scale = this.initial_radar_obj.sym_block[0][0].gate_scale * product_range_resolution[this.product_code];
        var first_bin = this.initial_radar_obj.sym_block[0][0].first;
        var prod_range = np_arange(num_bins).map(x => x * gate_scale + first_bin);
        return prod_range;
    }
    /**
     * Retrieves the radar's coordinates and altitude, by first searching the file's header, and if that fails, by looking up the radar's ICAO.
     * 
     * @param {String} station (optional) The four-letter ICAO of a radar station. If passed, the function will return the coordinates of that station.
     * @returns {Array} An array in the format [latitude, longitude, altitude]. Will return [0, 0, 0] if the radar's location could not be determined.
     */
    get_location(station = null) {
        var lat, lng, alt;

        if (station != null) {
            [lat, lng, alt] = get_nexrad_location(station);
            return [lat, lng, alt];
        } else {
            if (this.initial_radar_obj.hasOwnProperty('lat')) {
                // the coordinates and altitude are provided, so we'll return them
                return [this.initial_radar_obj.lat, this.initial_radar_obj.lon, this.initial_radar_obj.height];
            } else if (this.initial_radar_obj.hasOwnProperty('siteID')) {
                // no coordinates, but a site id is provided, so we'll look it up
                [lat, lng, alt] = get_nexrad_location(this.station);
            } else {
                // no coordinates OR site id, likely a corrupted file
                return [0, 0, 0];
            }
        }
    }
    /**
     * Finds the numerical VCP (volume coverage pattern) of the radar file. Returns 'null' if it could not be found.
     * 
     * @returns {Number} The VCP of the radar file.
     */
    get_vcp() {
        if (this.vcp != undefined) {
            return this.vcp;
        } else if (this.initial_radar_obj.prod_desc.vcp != undefined) {
            return this.initial_radar_obj.prod_desc.vcp;
        } else {
            return null;
        }
    }
    /**
     * Gets the date at which the radar volume was collected.
     * 
     * @returns {Date} A Date object that contains the radar volume's time.
     */
    get_date() {
        return this.initial_radar_obj.metadata.vol_time;
    }

    /**
     * Returns the elevation angle of the radar product.
     * 
     * @returns {Number} A number representing the file's elevation angle.
     * If the angle is "undefined", the return value will be "0.0".
     */
    get_elevation_angle() {
        const el_angle = this.initial_radar_obj.metadata.el_angle;
        return el_angle !== undefined ? el_angle : 0.0;
    }

    /**
     * Function that plots the factory with its radar data to the map.
     * No parameters are needed since this is a Level 3 file, and nothing is returned.
     */
    plot() {
        // 58 = storm tracks (NST)
        // 141 = mesocyclone detection (NMD)
        // 61 = tornado vortex signature (TVS)
        if (this.product_code == 58) {
            plot_storm_tracks(this);
        } else if (this.product_code == 61) {
            plot_tornado_vortex_signature(this);
        } else {
            this.display_file_info();
            window.atticData.nexrad_factory = this;
            calculate_coordinates(this);
        }
    }

    /**
     * Function that writes the necessary file information to the DOM.
     */
    display_file_info() {
        // execute code from another file
        display_file_info.apply(this);
    }

    /**
     * Generates a unique ID associated with the file.
     * 
     * @returns {String} A string with the file's ID.
     */
    generate_unique_id() {
        const station = this.station;
        const product_abbv = this.product_abbv;
        const date = this.get_date();
        const year = date.getUTCFullYear();
        const month = _zero_pad(date.getUTCMonth() + 1);
        const day = _zero_pad(date.getUTCDate());
        const hour = _zero_pad(date.getUTCHours());
        const minute = _zero_pad(date.getUTCMinutes());
        const second = _zero_pad(date.getUTCSeconds());

        const formatted_string = `${station}_${product_abbv}_${year}_${month}_${day}_${hour}_${minute}_${second}`;
        return formatted_string;
    }

    /**
     * Gets the file's age in minutes.
     * 
     * @returns {Number} The file's age in minutes
     */
    get_file_age_in_minutes() {
        const date_diff = get_date_diff_obj(this.get_date(), new Date());
        const duration = luxon.Duration.fromObject(date_diff);
        return duration.shiftTo('minutes').toObject().minutes;
    }

    /**
     * Zooms and pans the map to the radar's location.
     */
    fly_to_location() {
        const location = this.get_location();
        map.flyTo({ center: [location[1], location[0]], zoom: 6.5, speed: 1.75, essential: true });
    }

    /**
     * Helper function that scales all of the values in an input array to the desired size. This is useful when converting NEXRAD binary data from its stored format to its readable format, as defined in the ICD.
     * 
     * @param {*} inputValues A 1D or 2D array containing values you wish to scale.
     * @returns {Array} An array in the same shape as the original, but with the values scaled.
     */
    _scale_values(input_values) {
        for (var i in input_values) {
            if (ArrayBuffer.isView(input_values[i])) { // convert to regular array if it's a typed array
                input_values[i] = Array.from(input_values[i]);
            }
            if (Array.isArray(input_values[i])) { // this check allows for the scaling of 2D arrays
                input_values[i] = input_values[i].map(i => this.initial_radar_obj.map_data.__call__(i)); // perform the scaling function on every sub-element
            } else {
                input_values[i] = this.initial_radar_obj.map_data.__call__(input_values[i]);
            }
        }
        this.scaled = true;
        return input_values;
    }
}

function np_arange(start, stop, step) {
    if (stop === undefined) {
        stop = start;
        start = 0;
    }

    step = step === undefined ? 1 : step;
    if (step === 0) {
        throw new Error('Step must not be zero.');
    }

    const result = [];
    if (step > 0) {
        for (let value = start; value < stop; value += step) {
            result.push(value);
        }
    } else {
        for (let value = start; value > stop; value += step) {
            result.push(value);
        }
    }

    return result;
}

// https://github.com/ARM-DOE/pyart/blob/main/pyart/io/nexrad_level3.py
const product_range_resolution = {
    19: 1.0,  // 124 nm
    20: 2.0,  // 248 nm
    25: 0.25, // 32 nm
    27: 1.0,
    28: 0.25,
    30: 1.0,
    32: 1.0,
    34: 1.0,
    56: 1.0,
    78: 1.0,
    79: 1.0,
    80: 1.0,
    94: 1.0,
    99: 0.25,
    134: 1000.0,
    135: 1000.0,
    138: 1.0,
    153: 0.25,
    154: 0.25,
    155: 0.25,
    159: 0.25,
    161: 0.25,
    163: 0.25,
    165: 0.25,
    169: 1.0,
    170: 1.0,
    171: 1.0,
    172: 1.0,
    173: 1.0,
    174: 1.0,
    175: 1.0,
    176: 0.25,
    177: 0.25,
    180: 150.0,
    181: 150.0,
    182: 150.0,
    186: 300.0,
}

module.exports = Level3Factory;