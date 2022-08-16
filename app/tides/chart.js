const ut = require('../radar/utils');

function drawChart(divName, dataArray) {
    // initialize the modal
    $('#modalBtn').trigger('click');

    var valueArray = [];
    for (key in dataArray) {
        if (key != 0) {
            valueArray.push(dataArray[key][2]);
        }
    }
    var minValue = Math.min(...[...new Set(valueArray)]);
    var maxValue = Math.max(...[...new Set(valueArray)]);

    // console.log(minValue, maxValue)

    google.charts.load('current', {packages: ['corechart', 'line']});
    //google.charts.setOnLoadCallback(drawChart);
    ut.waitVisible(document.getElementById(divName), drawChart);

    function drawChart() {
        // https://stackoverflow.com/a/40262183 - code to add annotation line
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Time');
        data.addColumn({type: 'string', role: 'annotation'});
        data.addColumn('number', 'Height');
        data.addColumn('number', 'Test');

        data.addRows(dataArray);

        var chartDiv = document.getElementById(divName);
        var chart = new google.visualization.LineChart(chartDiv);

        var date_formatter = new google.visualization.DateFormat({ 
            pattern: "hh:mm aa  MMM d, yyyy"
        }); 
        date_formatter.format(data, 0);

        var curDate = new Date();

        const options = {
            curveType: 'function',
            series: {
                1: { color: '#000000', lineWidth: 0, enableInteractivity: false },
            },
            annotations: {
                stem: {
                    color: 'rgb(255, 0, 0)'
                },
                style: 'line'
            },
            hAxis: {
                title: 'Time',
                viewWindow: {
                    min: new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0),
                    max: new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 24)
                },
            },
            vAxis: {
                title: 'Height',
                viewWindowMode : 'explicit',
                viewWindow: {
                    min: minValue - 1.5,
                    max: maxValue + 1.5
                }
            },
            legend: {
                position: 'none'
            },
            explorer: {
                axis: 'horizontal',
                keepInBounds: true,
                maxZoomIn: 4.0,
                maxZoomOut: 2.0
            }
        }

        chart.draw(data, options);
    }
}

module.exports = drawChart;