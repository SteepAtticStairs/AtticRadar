const NEXRADLevel2File = require('./level2Parser');
const RadarWarehouse = require('../RadarWarehouse');

function level2(filename, callback) {
    fetch(filename)
    .then(response => response.arrayBuffer())
    .then(buffer => {
        var fileBuffer = Buffer.from(buffer);
        var file = new NEXRADLevel2File(fileBuffer);

        var warehouse = new RadarWarehouse(file);
        callback(warehouse);
    });
}

module.exports = level2;