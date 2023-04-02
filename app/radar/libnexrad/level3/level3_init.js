const NEXRADLevel3File = require('./level3_parser');
const Level3Factory = require('./level3_factory');

function level3(filename, callback) {
    fetch(filename)
    .then(response => response.arrayBuffer())
    .then(buffer => {
        var fileBuffer = Buffer.from(buffer);
        var file = new NEXRADLevel3File(fileBuffer);

        var l3Factory = new Level3Factory(file);
        callback(l3Factory);
    });
}

module.exports = level3;