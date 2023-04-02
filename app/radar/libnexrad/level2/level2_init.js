const NEXRADLevel2File = require('./level2_parser');
const Level2Factory = require('./level2_factory');

function level2(filename, callback) {
    fetch(filename)
    .then(response => response.arrayBuffer())
    .then(buffer => {
        var fileBuffer = Buffer.from(buffer);
        var file = new NEXRADLevel2File(fileBuffer);

        var l2Factory = new Level2Factory(file);
        callback(l2Factory);
    });
}

module.exports = level2;