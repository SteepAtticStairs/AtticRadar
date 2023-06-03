/**
 * https://www.wpc.ncep.noaa.gov/html/read_coded_bull.shtml
 */

const frontal_types = ['WARM', 'COLD', 'STNRY', 'OCFNT', 'TROF'];
const frontal_strength_types = ['WK', 'MDT', 'STG'];

class SurfaceFronts {
    constructor(raw_text) {
        this._extra = {};
        // this.raw_text = raw_text;
        this.lines = this._remove_empty_strings_from_array(raw_text.split('\n'));

        this.parse_header();
        this.parse_highs_lows();
        this.parse_fronts();
    }

    parse_fronts() {
        this.fronts = [];
        this.fronts.warm = [];
        this.fronts.cold = [];
        this.fronts.stationary = [];
        this.fronts.occluded = [];
        this.fronts.trough = [];

        var last_front_type;
        const fronts_lines = this.lines.slice(this._extra.fronts_pointer, this.lines.length);
        for (var i = 0; i < fronts_lines.length; i++) {
            const parts = this._remove_empty_strings_from_array(fronts_lines[i].split(' '));

            if (frontal_types.includes(parts[0])) {
                const current_front = {};
                const key_to_push_to = this._parse_front_type(parts[0]);
                last_front_type = key_to_push_to;
                const frontal_strength = this._parse_frontal_strength(parts[1]);
                current_front.strength = frontal_strength;

                var slice_index = 2;
                if (frontal_strength == null) slice_index = 1;
                const front_coordinates = this._parse_fronts_raw_data_row(parts.slice(slice_index, parts.length));
                current_front.coordinates = front_coordinates;

                this.fronts[key_to_push_to].push(current_front);
            } else {
                const front_coordinates = this._parse_fronts_raw_data_row(parts);

                const base = this.fronts[last_front_type];
                if (!(isNaN(front_coordinates[0][0]) || isNaN(front_coordinates[0][1]))) {
                    // console.log(last_front_type, front_coordinates)
                    this.fronts[last_front_type][base.length - 1].coordinates.push(...front_coordinates);
                }
            }
        }
    }

    parse_highs_lows() {
        this.highs = {};
        this.lows = {};

        var highs_lows_lines = [];
        for (var i = 6; i < this.lines.length; i++) {
            if (frontal_types.some(substr => this.lines[i].startsWith(substr))) {
                this._extra.fronts_pointer = i;
                break;
            } else {
                highs_lows_lines.push(this.lines[i]);
            }
        }
        highs_lows_lines = highs_lows_lines.join(' ').split('LOWS');

        const highs_text_raw = highs_lows_lines[0];
        // this.highs.highs_text_raw = highs_text_raw;
        const lows_text_raw = `LOWS${highs_lows_lines[1]}`;
        // this.lows.lows_text_raw = lows_text_raw;

        const highs_formatted = this._parse_highs_lows_raw_data(highs_text_raw);
        this.highs.highs_formatted = highs_formatted;
        const lows_formatted = this._parse_highs_lows_raw_data(lows_text_raw);
        this.lows.lows_formatted = lows_formatted;
    }

    parse_header() {
        this.header = {};
        const header_lines = this.lines.slice(0, 6);

        this.header.message_type = header_lines[1];
        this.header.message_description = header_lines[2];
        this.header.message_author = header_lines[3];
        this.header.date_string = header_lines[4];
        this.header.valid_time = header_lines[5];
    }

    _parse_highs_lows_raw_data(data) {
        data = data.replace('HIGHS', '');
        data = data.replace('LOWS', '');

        const pressures = [];
        const coordinates = [];

        const parts = this._remove_empty_strings_from_array(data.split(' '));
        // this is a simple check to see if the first item is a pressure value,
        // e.g. above 800 mb but below 1200 mb. If not, there is an error where
        // coordinates were provided first - in that case, simply remove the
        // leading "straggler".
        if (!(parseInt(parts[0]) > 800 && parseInt(parts[0]) < 1200)) {
            parts.shift();
        }

        for (var i = 0; i < parts.length; i++) {
            if (i % 2 == 0) {
                const pressure = parseInt(parts[i]);
                pressures.push(pressure);
                // console.log(pressure);
            } else {
                const [longitude, latitude] = this._parse_coordinates(parts[i]);
                coordinates.push([longitude, latitude]);
                // console.log(parts[i])
                // console.log(longitude, latitude)
            }
        }

        const highs_lows_formatted = [];
        for (var i = 0; i < pressures.length; i++) {
            highs_lows_formatted.push({
                pressure: pressures[i],
                coordinates: coordinates[i]
            })
        }

        return highs_lows_formatted;
    }

    _parse_fronts_raw_data_row(rows) {
        const parsed_coordinates = [];
        for (var i = 0; i < rows.length; i++) {
            const [longitude, latitude] = this._parse_coordinates(rows[i]);
            parsed_coordinates.push([longitude, latitude]);
        }
        return parsed_coordinates;
    }

    /**
     * https://github.com/Unidata/MetPy/blob/main/src/metpy/io/text.py#L20
     */
    _parse_coordinates(coordinates_string) {
        // Based on the number of digits, find the correct place to split between lat and lon
        // Hires bulletins provide 7 digits for coordinates; regular bulletins provide 4 or 5 digits
        var split_pos = Math.floor(coordinates_string.length / 2);
        var lat = coordinates_string.slice(0, split_pos);
        var lon = coordinates_string.slice(split_pos);

        // Insert decimal point at the correct place and convert to float
        lat = parseFloat(lat.slice(0, 2) + '.' + lat.slice(2));
        lon = -parseFloat(lon.slice(0, 3) + '.' + lon.slice(3));

        return [lon, lat];
    }

    _parse_front_type(abbv) {
        if (abbv == 'WARM') return 'warm';
        if (abbv == 'COLD') return 'cold';
        if (abbv == 'STNRY') return 'stationary';
        if (abbv == 'OCFNT') return 'occluded';
        if (abbv == 'TROF') return 'trough';
        else return 'unknown';
    }

    _parse_frontal_strength(abbv) {
        if (abbv == 'WK') return 'weak';
        if (abbv == 'MDT') return 'moderate';
        if (abbv == 'STG') return 'strong';
        else return null;
    }

    _remove_empty_strings_from_array(array) {
        return array.filter(line => { return line.trim() != '' });
    }
}

module.exports = SurfaceFronts;