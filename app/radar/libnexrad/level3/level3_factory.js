const get_nexrad_location = require('../nexrad_locations').get_nexrad_location;
const station_abbreviations = require('../../../../resources/stationAbbreviations');
const level3_formatters = require('./level3_formatters');
const calculate_coordinates = require('../../plot/calculate_coordinates');

/**
 * A class that provides simple access to the radar data returned from the 'NEXRADLevel3File' class.
 */
class Level3Factory {
    constructor (initial_radar_obj) {
        this.initial_radar_obj = initial_radar_obj;

        this.nexrad_level = 3;

        this.header = initial_radar_obj.header;
        this.vcp = initial_radar_obj.prod_desc.vcp;
        this.product_code = this.header.code;
        this.product_abbv = initial_radar_obj.product_abbv;
        this.station = station_abbreviations[this.initial_radar_obj.siteID];

        var tab_pages = this.initial_radar_obj?.tab_pages;
        if (this.product_code == 58) {
            // storm tracks
            this.formatted_tabular = level3_formatters.format_storm_tracks(tab_pages);
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
        data = this._scale_values(data);

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
        var max_range = this.initial_radar_obj.max_range;
        var num_bins = this.initial_radar_obj.sym_block[0][0].num_bins;
        var prod_range = np_linspace(0, max_range, num_bins + 1);
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
     * Function that plots the factory with its radar data to the map.
     * No parameters are needed since this is a Level 3 file, and nothing is returned.
     */
    plot() {
        calculate_coordinates(this);
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
        return input_values;
    }
}

// https://stackoverflow.com/a/40475362/18758797
function np_linspace(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
}

module.exports = Level3Factory;