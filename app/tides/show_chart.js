function show_chart(tide_height_array, station_name) {
    // console.log(tide_height_array);

    const timezone_offset = new Date().getTimezoneOffset();
    // https://stackoverflow.com/a/34405528
    const local_zone_abbv = new Date().toLocaleTimeString('en-us', { timeZoneName:'short' }).split(' ')[2];
    // https://api.highcharts.com/class-reference/Highcharts.Time#dateFormat
    const day_format = '%b %e';
    const time_format = '%l:%M %p';
    const full_date_format = `${day_format}<br>${time_format}`;

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
            plotBorderWidth: 2
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
                        return Highcharts.dateFormat(`<b>${full_date_format}</b>`, ms);
                    } else {
                        return Highcharts.dateFormat(time_format, ms);
                    }
                }
            },
            gridLineWidth: 1,
            gridLineColor: gridline_grey_color
            // http://jsfiddle.net/phpdeveloperrahul/ddELH
            // dateTimeLabelFormats: {
            //     day: full_date_format,
            // },
            // min: tide_height_array[0][0],
            // max: tide_height_array[tide_height_array.length - 1][0]
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
                return `<b>${this.y} ft</b><br>${Highcharts.dateFormat(`%a ${full_date_format} ${local_zone_abbv}`, new Date(this.x))}`;
            }
        },
        series: [{
            data: tide_height_array
        }]
    });
}

module.exports = show_chart;