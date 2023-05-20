const SurfaceFronts = require('./SurfaceFronts');
const plot_data = require('./plot_data');
const ut = require('../core/utils');

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
            const formatted_lines = data.replaceAll('\r', '').split('\n').filter(line => { return line.trim() != '' });
            const split_index = formatted_lines.indexOf('$$');

            const lowres_lines = formatted_lines.slice(0, split_index - 1);
            const hires_lines = formatted_lines.slice(split_index + 1, formatted_lines.length - 1);

            const lowres_bulletin = lowres_lines.join('\n');
            const hires_bulletin = hires_lines.join('\n');

            const fronts = new SurfaceFronts(hires_bulletin);
            console.log(fronts);
            plot_data(fronts);
        })
    })
}

module.exports = fetch_data;