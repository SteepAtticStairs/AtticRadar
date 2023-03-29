const NEXRADLevel3File = require('./level3Parser');
const Level3Factory = require('./level3Factory');

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