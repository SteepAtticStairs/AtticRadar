const pako = require('pako');
const parseHurricaneFile = require('./parseHurricaneFile');

function unGZip(gzArrayBuffer) {
    var csv = pako.inflate(new Uint8Array(gzArrayBuffer), { to: 'string' });
    parseHurricaneFile(csv);
}

module.exports = unGZip;