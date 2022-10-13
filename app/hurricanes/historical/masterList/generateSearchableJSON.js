const fs = require('fs')

function csvToJson(csv) {
    function onlySpaces(str) { return str.trim().length === 0; }

    var obj = {};
    var rows = csv.split('\n');
    for (var row in rows) {
        var curRowItem = rows[row].split(',');
        for (var i in curRowItem) {
            curRowItem[i] = curRowItem[i].replace(/ /g, '')
        }
        //obj[row] = curRowItem;
        var year = curRowItem[8];
        var name = curRowItem[0];
        var basin = curRowItem[1];
        var stormID = curRowItem[20];

        if (!obj.hasOwnProperty(year)) {
            obj[year] = [];
        }
        obj[year].push([name, stormID, year, basin])
    }
    return obj;
}

const data = fs.readFileSync('storm.table', { encoding: 'utf8' })

var rows = data.split('\n')
var json = csvToJson(data);
fs.writeFileSync('allStorms.js', JSON.stringify(json));