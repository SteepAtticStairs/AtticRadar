// decompress a nexrad level 2 archive, or return the provided file if it is not compressed

// bzip
const bzip = require('seek-bzip');

// gzip
const gzipDecompress = require('./gzipdecompress');

// structured byte access
const { RandomAccessFile, BIG_ENDIAN } = require('./classes/RandomAccessFile');

// constants
const { FILE_HEADER_SIZE } = require('./constants');

const ut = require('../../app/radar/utils');

const decompress = (raf, opt, callback) => {
	// detect gzip header
	const gZipHeader = raf.read(2);
	raf.seek(0);
	if (gZipHeader[0] === 31 && gZipHeader[1] === 139) {
		console.log('file is gzipped, decompressing...')
		callback(gzipDecompress(raf));
	}
	console.log('file is not gzipped, reading contents...')

	// if file length is less than or equal to the file header size then it is not compressed
	if (raf.getLength() <= FILE_HEADER_SIZE) return raf;
	let headerSize = 0;
	// get the compression record
	const compressionRecord = readCompressionHeader(raf);

	// test for the magic number 'BZh' for a bzip compressed file
	if (compressionRecord.header !== 'BZh') {
		console.log('header is not compressed, checking first archive...')
		// not compressed, try again with after skipping the file header (first chunk or complete archive)
		raf.seek(0);
		raf.skip(FILE_HEADER_SIZE);
		headerSize = FILE_HEADER_SIZE;
		const fullCompressionRecord = readCompressionHeader(raf);
		if (fullCompressionRecord.header !== 'BZh') {
			console.log('radar data is not compressed at all')
			// not compressed in either form, return the original file at the begining
			raf.seek(0);
			return raf;
		}
	}
	console.log('file contents are compressed, decompressing...')
	// compressed file, start decompressing
	// the format is (int) size of block + 'BZh9' + compressed data block, repeat
	// start by locating the begining of each compressed block by jumping to each offset noted by the size header
	const positions = [];
	// jump back before the first detected compression header
	raf.seek(raf.getPos() - 8);

	// loop until the end of the file is reached
	while (raf.getPos() < raf.getLength()) {
		// block size may be negative
		const size = Math.abs(raf.readInt());
		// store the position
		positions.push({
			pos: raf.getPos(),
			size,
		});
		// jump forward
		raf.seek(raf.getPos() + size);
	}

	// reuse the original header if present
	const outBuffers = [raf.buffer.slice(0, headerSize)];

	var itersBeforeStop = 1000;
	if (opt == 'part') {
		itersBeforeStop = 10;
	}
	var iters = 1;

	// create a promise that will resolve on the next tick of the event loop
	function sleep() { 
		return new Promise(r => setTimeout(r));
	}
	async function handleHeavyLifting() {
		ut.progressBarVal('show');
		ut.progressBarVal('label', '')
		// loop through each block and decompress it
		for (const block of positions) {
			if (iters < itersBeforeStop) {
				console.log('decompressing block ' + iters);
				iters++;
				// extract the block from the buffer
				const compressed = raf.buffer.slice(block.pos, block.pos + block.size);
				if (JSON.stringify(compressed) != '{"type":"Buffer","data":[]}') {
					const output = bzip.decodeBlock(compressed, 32); // skip 32 bits 'BZh9' header
					outBuffers.push(output);

					ut.progressBarVal('set', ut.scale(iters, 0, positions.length, 0, 100));
					await sleep();
				}
			}
		};
		// combine the buffers
		const outBuffer = Buffer.concat(outBuffers);

		// pass the buffer to RandomAccessFile and return the result
		callback(new RandomAccessFile(outBuffer, BIG_ENDIAN));
		//return new RandomAccessFile(outBuffer, BIG_ENDIAN);
	}
	handleHeavyLifting();
};

// compression header is (int) size of block + 'BZh' + one character block size
const readCompressionHeader = (raf) => ({
	size: raf.readInt(),
	header: raf.readString(3),
	block_size: raf.readString(1),
});

module.exports = decompress;
