const SurfaceFronts = require('./SurfaceFronts');
const plot_data = require('./plot_data');
const ut = require('../core/utils');

function _remove_empty_strings_from_array(array) {
    return array.filter(line => { return line.trim() != '' });
}

function _find_hires_bulletin(all_bulletins_array) {
    var lowres_found;
    for (var i = 0; i < all_bulletins_array.length; i++) {
        const current_bulletin = all_bulletins_array[i];
        const current_bulletin_split = current_bulletin.split('\n');

        const last_line = current_bulletin_split[current_bulletin_split.length - 1];
        const last_line_split = _remove_empty_strings_from_array(last_line.split(' '));

        const numbers = last_line_split.filter(Number);
        if ((numbers[0].length == 4 || numbers[0].length == 5) && lowres_found == undefined) {
            lowres_found = current_bulletin;
        }
        if (numbers[0].length == 7) {
            return current_bulletin;
        }
    }
    return lowres_found;
}

const directory_list_url = `https://tgftp.nws.noaa.gov/SL.us008001/DF.c5/DC.textf/DS.codas/ls-lt`;

function fetch_data() {
    fetch(ut.phpProxy + directory_list_url)
    .then(response => response.text())
    .then(data => {
        const lines = data.split('\n');

        var latest_time;
        var latest_filename;
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split(/[ ]+/);
            if (!lines[i][0] == '') {
                const month = lines[i][5];
                const day = lines[i][6];
                const time = lines[i][7];
                const formatted_time = new Date(`${month} ${day}, ${new Date().getUTCFullYear()} ${time}`);
                const filename = lines[i][8];

                if (latest_time == undefined) {
                    latest_time = formatted_time;
                    latest_filename = filename;
                } else {
                    if (formatted_time.getTime() > latest_time.getTime()) {
                        latest_time = formatted_time;
                        latest_filename = filename;
                    }
                }
            }
        }

        const latest_file_url = `https://tgftp.nws.noaa.gov/SL.us008001/DF.c5/DC.textf/DS.codas/${latest_filename}`;
        fetch(ut.phpProxy + latest_file_url)
        .then(response => response.text())
        .then(data => {
            var formatted_lines = _remove_empty_strings_from_array(data.replaceAll('\r', '').split('\n'));
            formatted_lines = formatted_lines.join('\n');

            const split_bulletins = formatted_lines.split(/(?<!\$\$)\$\$(?!\$\$)/);

            const joined_bulletins = [];
            for (var i in split_bulletins) {
                var temp_split = split_bulletins[i].split('\n');
                temp_split = _remove_empty_strings_from_array(temp_split);
                if (temp_split.length != 0) {
                    joined_bulletins.push(temp_split.join('\n'));
                }
            }

            const hires_bulletin = _find_hires_bulletin(joined_bulletins);

            const fronts = new SurfaceFronts(hires_bulletin);
            console.log(fronts);
            plot_data(fronts);
        })
    })
}

module.exports = fetch_data;