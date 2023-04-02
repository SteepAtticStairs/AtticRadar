const get_nexrad_location = require('../nexrad_locations');
const calculate_coordinates = require('../../plot/calculate_coordinates');

/**
 * A class that provides simple access to the radar data returned from the 'NEXRADLevel2File' class.
 * It sorts the radar sweeps by elevation, and provides several functions that assist with retrieving specific bits of data.
 */
class Level2Factory {
    constructor (initial_radar_obj) {
        this.initial_radar_obj = initial_radar_obj;

        this.nexrad_level = 2;

        this.header = initial_radar_obj.volume_header;
        this.vcp = initial_radar_obj.vcp;
        this.nscans = this.initial_radar_obj.nscans;

        this._group_and_sort_sweeps();
    }
    /**
     * Get the gate values for a given moment and elevation number.
     * 
     * @param {*} moment The moment being requested. Can be one of the following: 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO', 'CFP'
     * @param {Number} elevationNumber A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Array} A 2D array, with each sub-array being an array of its corresponding radial's data.
     */
    get_data(moment, elevationNumber) {
        var data = this.get_value_from_sweep('data', moment, elevationNumber);

        var prod_hdr = this.grouped_sweeps[elevationNumber][0][moment];
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
     * @param {Number} elevationNumber A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Array} An array, containing all of the azimuth angles for each radial in the sweep.
     */
    get_azimuth_angles(elevationNumber) {
        var azimuths = this.get_value_from_sweep('azimuth_angle', 'msg_header', elevationNumber);

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
     * @param {Number} elevationNumber A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Array} An array, containing all of the ranges for any azimuth in the sweep.
     */
    get_ranges(moment, elevationNumber) {
        var prod_hdr = this.grouped_sweeps[elevationNumber][0][moment];
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
     * @param {Number} elevationNumber A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Array} An array, containing the requested values for each radial in a sweep.
     */
    get_value_from_sweep(key, moment, elevationNumber) {
        var output = [];
        var curSweep = this.grouped_sweeps[elevationNumber];
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
     * @returns {Array} An array in the format [latitude, longitude, altitude]. Will return [0, 0, 0] if the radar's location could not be determined.
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
     * Gets the date at which the radar volume was collected.
     * If an elevation number is passed, the date for that sweep is returned.
     * If nothing is passed, the date for the whole volume is returned.
     * 
     * @param {Number} elevationNumber A number that represents the elevation's index from the base sweep. Indices start at 1.
     * @returns {Date} A Date object that contains the radar volume's time.
     */
    get_date(elevationNumber = null) {
        var modifiedJulianDate, milliseconds;

        if (elevationNumber == null) {
            modifiedJulianDate = this.header.date;
            milliseconds = this.header.time;
        } else {
            // the date & time for the first radial in a sweep. each radial has its own date,
            // but we'll only use the first one, representing the start of the sweep.
            var sweepHeader = this.grouped_sweeps[elevationNumber][0].header;
            modifiedJulianDate = sweepHeader.date;
            milliseconds = sweepHeader.ms;
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
     * @param {Number} elevationNumber A number that represents the elevation's index from the base sweep. Indices start at 1.
     */
    plot(moment, elevationNumber) {
        const options = {'product': moment, 'elevation': elevationNumber};
        calculate_coordinates(this, options);
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