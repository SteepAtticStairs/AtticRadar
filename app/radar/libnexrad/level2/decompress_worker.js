const compressjs = require('../../../../lib/compressjs/main');
const RandomAccessFile = require('../buffer_tools/RandomAccessFile');
const BufferPack = require('bufferpack');
const level2_constants = require('./level2_constants');

function _structure_size(structure) {
    /* Find the size of a structure in bytes. */
    var format = '>' + structure.map(i => i[1]).join('');
    var size = BufferPack.calcLength(format);
    return size;
}

module.exports = function (self) {
    self.addEventListener('message', function (ev) {
        var seen_length = 0;
        class RadarDecompressor {
            constructor() {
                this.unused_data;
            }
            _decompress_chunk(chunk) {
                const algorithm = compressjs.Bzip2;
                return algorithm.decompressFile(chunk);
                // skip 32 bits 'BZh9' header
                // return bzip.decodeBlock(chunk, 32);
                // https://github.com/jvrousseau/bzip2.js
                // return bzip2.simple(bzip2.array(chunk));
            }
            decompress(data) {
                this.compressedData = data;

                var rafData = new RandomAccessFile(data);
                var blockSize = Math.abs(rafData.readInt());

                var block_percent = blockSize / ev.data.length;
                seen_length += block_percent;
                var percent_loaded = parseFloat((seen_length * 100).toFixed(1));
                if (percent_loaded > 100) { percent_loaded = 100 }
                self.postMessage({ 'message': 'progress', 'data': percent_loaded });

                data = data.slice(level2_constants.CONTROL_WORD_SIZE, data.length);
                var uncompressed = this._decompress_chunk(data);

                this.unused_data = data.slice(blockSize, data.length);
                if (blockSize > data.length) {
                    this.unused_data = new Buffer.alloc(0);
                }

                return uncompressed;
            }
        }

        function _decompress_records(file_handler) {
            /* Decompressed the records from an BZ2 compressed Archive 2 file. */
            file_handler.seek(0);
            // read all data from the file
            var cbuf = file_handler.peek();
            var decompressor = new RadarDecompressor();
            // skip the radar file header (24 bits)
            var skip = _structure_size(level2_constants.VOLUME_HEADER);
            // initialize the buffer with all of the radar file's data, except for the header
            var buf = [decompressor.decompress(cbuf.slice(skip, cbuf.length))];
            // while there's still data to decompress
            while (decompressor.unused_data.length) {
                // store the remaining compressed data
                cbuf = decompressor.unused_data;
                // create a new RadarDecompressor
                decompressor = new RadarDecompressor();
                var decompressed = decompressor.decompress(cbuf);
                // uncompress and push to the final buffer
                buf.push(decompressed);
            }
            // combine the array of Uint8Arrays + 1 buffer to a single buffer
            var finalBuffer = Buffer.concat(buf);
            // trim the 'COMPRESSION_RECORD_SIZE' from the start of the buffer
            finalBuffer = finalBuffer.slice(level2_constants.COMPRESSION_RECORD_SIZE, finalBuffer.length);
            return finalBuffer;
        }

        var fh = new RandomAccessFile(ev.data);
        const buf = _decompress_records(fh);

        self.postMessage({ 'message': 'finish', 'data': buf });
    })
}