const get_individual_data = require('./get_individual_data');
const luxon = require('luxon');

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

    const first_tide_time = tide_height_array[0][0];
    const last_tide_time = tide_height_array[tide_height_array.length - 1][0];

    const grey_color = 'rgb(180, 180, 180)';
    const gridline_grey_color = 'rgb(90, 90, 90)';

    function tick_formatter(value, axis) {
        const ms = value;
        const date = luxon.DateTime.fromMillis(ms);

        if (date.hour == 0) {
            return date.toFormat(`h a<br>ccc L/d`);
            // return Highcharts.dateFormat(`%a ${full_date_format}`, ms);
        } else {
            return date.toFormat(`h a`);
            // return Highcharts.dateFormat(time_format, ms);
        }
    }

    const plot = $.plot($('#tide_chart_container'), [
        tide_height_array,
        // [[Date.now(), 100], [Date.now(), -100]]
    ], {
        grid: {
            margin: {
                top: 20,
                bottom: 20,
                left: 20,
                right: 20
            },
            color: grey_color,
            markings: [],
            hoverable: true,
			clickable: true
        },
        xaxis: {
            mode: 'time',
            tickFormatter: tick_formatter,
            min: start_of_today.getTime(),
            max: end_of_today.getTime(),
            autoScale: 'none',
            timeBase: 'milliseconds',
            // http://www.flotcharts.org/flot/API/
            font: {
                fill: grey_color
            },
            axisZoom: true,
            plotZoom: true,
            axisPan: true,
            plotPan: true,
            zoomRange: [6 * 60 * 60 * 1000, end_of_today.getTime() - start_of_today.getTime()], // 6 hours
            panRange: [first_tide_time, last_tide_time]
        },
        yaxis: {
            font: {
                fill: grey_color
            },
            axisZoom: false,
            plotZoom: false,
            axisPan: false,
            plotPan: false,
        },
        series: {
            // https://github.com/MichaelZinsmaier/CurvedLines
            curvedLines: {
                apply: true,
                active: true,
            },
            lines: {
                lineWidth: 3
            }
        },
        colors: ['#4193bf'],
        zoom: {
            interactive: true,
            active: true,
            amount: 1.5,
            enableTouch: true,
        },
        pan: {
            interactive: true,
            active: true,
            cursor: 'move',
            frameRate: 60,
            mode: 'smart',
            enableTouch: true,
        },
    });

    function _update_chart() {
        const line_width = plot.getAxes().xaxis.c2p(1.25) - plot.getAxes().xaxis.c2p(0);
        const now = Date.now() + 43200000;
        plot.getOptions().grid.markings = [{ xaxis: { from: now - line_width, to: now + line_width }, color: 'rgb(172, 63, 63)' }];
        // plot.draw();

        $('.flot-x-axis').find('text').each(function(index) {
            $(this).css('text-anchor', 'middle');

            const bbox = $(this).get(0).getBBox();
            $(this).css('transform', `translate(${bbox.width / 2}px)`);

            if ($(this).text().includes('/')) {
                $(this).css('font-weight', 'bold');
            }
        })
    }
    _update_chart();
    plot.draw();

    plot.hooks.draw.push(function(plot, ctx) {
        _update_chart();
    });

    // const grey_color = 'rgb(180, 180, 180)';
    // const gridline_grey_color = 'rgb(90, 90, 90)';
    // Highcharts.setOptions({
    //     time: {
    //         timezoneOffset: timezone_offset
    //     }
    // });
    // Highcharts.chart('tide_chart_container', {
    //     chart: {
    //         type: 'spline',
    //         backgroundColor: 'transparent',
    //         plotBorderColor: grey_color,
    //         plotBorderWidth: 2,
    //         // animation: false
    //     },
    //     title: {
    //         text: station_name,
    //         style: { color: grey_color },
    //     },
    //     xAxis: {
    //         lineColor: grey_color,
    //         type: 'datetime',
    //         labels: {
    //             style: { color: grey_color },
    //             formatter: function() {
    //                 const ms = this.value;
    //                 const date = new Date(ms);

    //                 if (date.getHours() == 0) {
    //                     return Highcharts.dateFormat(`<b>%a ${full_date_format}</b>`, ms);
    //                 } else {
    //                     return Highcharts.dateFormat(time_format, ms);
    //                 }
    //             }
    //         },
    //         plotLines: [{ color: 'rgb(172, 63, 63)', value: Date.now(), width: 2 }],
    //         gridLineWidth: 1,
    //         gridLineColor: gridline_grey_color,
    //         // http://jsfiddle.net/phpdeveloperrahul/ddELH
    //         // dateTimeLabelFormats: {
    //         //     day: full_date_format,
    //         // },
    //         min: start_of_today.getTime(),
    //         max: end_of_today.getTime(),
    //     },
    //     yAxis: {
    //         title: {
    //             enabled: true,
    //             text: 'Wave Height (ft)',
    //             style: { color: grey_color }
    //         },
    //         labels: {
    //             style: { color: grey_color }
    //         },
    //         // min: min_height - Math.floor(min_height) >= 0.5 ? Math.floor(min_height) : Math.floor(min_height) - 1,
    //         // max: Math.ceil(max_height) - max_height >= 0.5 ? Math.ceil(max_height) : Math.ceil(max_height) + 1,
    //         tickAmount: 3,
    //         // tickPositions: [min_height - 1, 0,  max_height + 1],
    //     },
    //     legend: {
    //         enabled: false
    //     },
    //     tooltip: {
    //         formatter: function () {
    //             if (tooltip_enabled) {
    //                 return `<b>${this.y} ft</b><br>${Highcharts.dateFormat(extra_full_date_format, new Date(this.x))}`;
    //             } else {
    //                 return false;
    //             }
    //         }
    //     },
    //     series: [{
    //         data: tide_height_array
    //     }]
    // });

    // $('#tide_stations_datepicker').datepicker({
    //     todayHighlight: true
    // });

    // $('#tide_stations_datepicker').off();
    // $('#tide_stations_datepicker').on('changeDate', (e) => {
    //     const selected_date = e.dates[0];

    //     get_individual_data(station_id, station_name, selected_date, (tide_height_array, station_name) => {
    //         show_chart(tide_height_array, station_name, station_id, selected_date);
    //     })
    // })
}

module.exports = show_chart;