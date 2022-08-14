function drawChart(divName, dataArray) {
    var valueArray = [];
    for (key in dataArray) {
        if (key != 0) {
            valueArray.push(dataArray[key][1]);
        }
    }
    var minValue = Math.min(...[...new Set(valueArray)]);
    var maxValue = Math.max(...[...new Set(valueArray)]);

    console.log(minValue, maxValue)

    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawBasic);

    function drawBasic() {
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Time');
        data.addColumn('number', 'Height');

        data.addRows(dataArray);

        var options = {
            hAxis: {
                title: 'Time',
            },
            vAxis: {
                title: 'Height',
                viewWindowMode : 'explicit',
                viewWindow: {
                    min: minValue - 1.5,
                    max: maxValue + 1.5
                }
            },
            curveType: 'function',
            legend: {position: 'none'}
        };

        var chart = new google.visualization.LineChart(document.getElementById(divName));
        chart.draw(data, options);
    }
}

module.exports = drawChart;