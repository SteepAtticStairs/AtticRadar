const ut = require('../../radar/utils');

function parseHurricaneFile(hurricaneCSV) {
    var json = ut.csvToJson(hurricaneCSV);
    console.log(json)
}

module.exports = parseHurricaneFile;