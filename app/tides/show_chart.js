const get_individual_data = require('./get_individual_data');
const luxon = require('luxon');

function show_chart(tide_height_array, station_name, station_id, ref_date) {
    // console.log(tide_height_array);

    const timezone_offset = new Date().getTimezoneOffset();
    // https://stackoverflow.com/a/34405528
    const local_zone_abbv = new Date().toLocaleTimeString('en-us', { timeZoneName:'short' }).split(' ')[2];
    // https://api.highcharts.com/class-reference/Highcharts.Time#dateFormat
    const day_format = '%b %e';
    const time_format = '%l:%M %P';
    const full_date_format = `${day_format}<br>${time_format}`;
    const extra_full_date_format = `%a ${full_date_format} ${local_zone_abbv}`;
    // Sun Jun 25
    // 1:39 PM EDT

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

    const placeholder = $('#tide_chart_container');
    const plot = $.plot(placeholder, [
        tide_height_array
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
            timezone: 'browser',
            tickFormatter: tick_formatter,
            min: start_of_today.getTime(),
            max: end_of_today.getTime(),
            autoScale: 'none',
            timeBase: 'milliseconds',
            showTickLabels: 'all',
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
        xaxes: [{
            position: 'top',
            show: true,
            showTickLabels: 'none',
            showTicks: false,
            gridLines: false,

            axisLabel: `<div style="color: ${grey_color}; font-size: 20px; font-weight: bold">${station_name}</div>`,
            axisLabelPadding: 4,
            // axisLabelUseCanvas: true,
            // axisLabelFontSizePixels: 20,
            // axisLabelColour: grey_color
        }, {
            position: 'bottom',
            show: true,
            showTicks: true,
            gridLines: true
        }],
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
            },
            points: {
                show: false
            }
        },
        colors: ['#4193bf'],
        // zoom: {
        //     interactive: true,
        //     active: true,
        //     amount: 1.5,
        //     enableTouch: true,
        // },
        // pan: {
        //     interactive: true,
        //     active: true,
        //     cursor: 'move',
        //     frameRate: 60,
        //     mode: 'smart',
        //     enableTouch: true,
        // },
    });

    $('<div id="flot_tooltip"></div>').css({
        position: 'absolute',
        background: 'rgb(255, 255, 255)',
        padding: '0.4em 0.6em',
        border: '1px solid rgb(17, 17, 17)',
        'z-index': '1040',
        'border-radius': '0.5em',
        'font-size': '0.8em',
        'white-space': 'nowrap',
        'pointer-events': 'none'
    }).appendTo('body');

    placeholder.off('plothover');
    placeholder.on('plothover', function (event, pos, item) {
        if (!pos.x || !pos.y) {
            return;
        }

        if (item) {
            const x = item.datapoint[0];
            const y = item.datapoint[1].toFixed(1);

            const date = luxon.DateTime.fromMillis(x);
            const formatted_date = date.toFormat('ccc LLL d<br>h:mm a ZZZZ');

            const tooltip_html = 
`<div>
<b>${formatted_date}</b><br>\
<span style="font-size: 20px; color: rgb(110, 110, 110); font-weight: bold">${y} ft</span>
</div>`;

            $('#flot_tooltip').html(tooltip_html)
                .css({ top: item.pageY + 5, left: item.pageX + 5 })
                .show();
        } else {
            $('#flot_tooltip').hide();
        }
    });

    function _update_chart() {
        const line_width = plot.getAxes().xaxis.c2p(1.25) - plot.getAxes().xaxis.c2p(0);
        const now = Date.now();
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