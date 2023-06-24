const get_individual_data = require('./get_individual_data');

function show_chart(tide_height_array, station_name, station_id, ref_date) {
    // console.log(tide_height_array);

    var tooltip_enabled = true;

    const timezone_offset = new Date().getTimezoneOffset();
    // https://stackoverflow.com/a/34405528
    const local_zone_abbv = new Date().toLocaleTimeString('en-us', { timeZoneName:'short' }).split(' ')[2];
    // https://api.highcharts.com/class-reference/Highcharts.Time#dateFormat
    const day_format = '%b %e';
    const time_format = '%l:%M %p';
    const full_date_format = `${day_format}<br>${time_format}`;
    const extra_full_date_format = `%a ${full_date_format} ${local_zone_abbv}`;

    // https://stackoverflow.com/a/8636674
    const start_of_today = new Date(ref_date.getTime());
    start_of_today.setHours(0, 0, 0, 0);
    const end_of_today = new Date(ref_date.getTime());
    end_of_today.setHours(23, 59, 59, 999);

    const grey_color = 'rgb(180, 180, 180)';
    const gridline_grey_color = 'rgb(90, 90, 90)';
    Highcharts.setOptions({
        time: {
            timezoneOffset: timezone_offset
        }
    });
    Highcharts.chart('tide_chart_container', {
        chart: {
            type: 'spline',
            backgroundColor: 'transparent',
            plotBorderColor: grey_color,
            plotBorderWidth: 2,
            // animation: false
        },
        title: {
            text: station_name,
            style: { color: grey_color },
        },
        xAxis: {
            lineColor: grey_color,
            type: 'datetime',
            labels: {
                style: { color: grey_color },
                formatter: function() {
                    const ms = this.value;
                    const date = new Date(ms);

                    if (date.getHours() == 0) {
                        return Highcharts.dateFormat(`<b>%a ${full_date_format}</b>`, ms);
                    } else {
                        return Highcharts.dateFormat(time_format, ms);
                    }
                }
            },
            plotLines: [{ color: 'rgb(172, 63, 63)', value: Date.now(), width: 2 }],
            gridLineWidth: 1,
            gridLineColor: gridline_grey_color,
            // http://jsfiddle.net/phpdeveloperrahul/ddELH
            // dateTimeLabelFormats: {
            //     day: full_date_format,
            // },
            min: start_of_today.getTime(),
            max: end_of_today.getTime(),
        },
        yAxis: {
            title: {
                enabled: true,
                text: 'Wave Height (ft)',
                style: { color: grey_color }
            },
            labels: {
                style: { color: grey_color }
            },
            // min: min_height - Math.floor(min_height) >= 0.5 ? Math.floor(min_height) : Math.floor(min_height) - 1,
            // max: Math.ceil(max_height) - max_height >= 0.5 ? Math.ceil(max_height) : Math.ceil(max_height) + 1,
            tickAmount: 3,
            // tickPositions: [min_height - 1, 0,  max_height + 1],
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function () {
                if (tooltip_enabled) {
                    return `<b>${this.y} ft</b><br>${Highcharts.dateFormat(extra_full_date_format, new Date(this.x))}`;
                } else {
                    return false;
                }
            }
        },
        series: [{
            data: tide_height_array
        }]
    });

    $('#tide_stations_datepicker').datepicker({
        todayHighlight: true
    });

    $('#tide_stations_datepicker').off();
    $('#tide_stations_datepicker').on('changeDate', (e) => {
        const selected_date = e.dates[0];

        get_individual_data(station_id, station_name, selected_date, (tide_height_array, station_name) => {
            show_chart(tide_height_array, station_name, station_id, selected_date);
        })
    })
}

module.exports = show_chart;