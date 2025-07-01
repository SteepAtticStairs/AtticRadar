const pako = require('pako');

/**
 * Detect the NEXRAD level from a radar file.
 * 
 * @param {Buffer} buffer A buffer containing the radar file data.
 * @returns {Number} A number representing the radar file's NEXRAD level. This can be "2", "3", or "undefined" in the case of an error.
 */
function detect_level(buffer) {
    // detect the magic number BZh9 (31, 139)
    if (buffer[0] == 31 && buffer[1] == 139) {
        var decompressed = pako.inflate(buffer);
        decompressed = Buffer.from(decompressed);
        buffer = decompressed;
    }

    const pseudo_header = buffer.slice(0, 100);
    const pseudo_header_string = pseudo_header.toString('UTF-8');

    if (pseudo_header_string.startsWith('SDUS')) {
        // standard level 3 file
        return 3;
    } else if (pseudo_header_string.startsWith('AR2V')) {
        // standard level 2 file (e.g. tape is "AR2V0006.")
        return 2;
    } else if (pseudo_header_string.startsWith('ARCHIVE2')) {
        // older level 2 file
        return 2;
    } else {
        return undefined;
    }
}

module.exports = detect_level;