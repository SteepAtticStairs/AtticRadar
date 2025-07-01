const { RandomAccessFile, BIG_ENDIAN } = require('./classes/RandomAccessFile');
const { Level2Record } = require('./classes/Level2Record');
const { RADAR_DATA_SIZE } = require('./constants');
const decompress = require('./decompress');
const parseHeader = require('./parseheader');

const ut = require('../../../app/radar/utils');

/**
 * @typedef {object} ParsedData Intermediate parsed radar data, further processed by Level2Radar
	*	@property {object} data Grouped and sorted data
	*	@property {Header} header
	*	@property {Vcp} vcp
	*	@property {boolean} isTruncated
	*	@property {boolean} hasGaps
 */

/**
 * Internal function. Parses a Nexrad Level 2 Data archive or chunk. Provide `rawData` as a `Buffer`.
 *
 * @class parseData
 * @param {Buffer} file Buffer with Nexrad Level 2 data. Alternatively a Level2Radar object, typically used internally when combining data.
 * @param {object} [options] Parser options
 * @param {(object | boolean)} [options.logger=console] By default error and information messages will be written to the console. These can be suppressed by passing false, or a custom logger can be provided. A custom logger must provide the log(), warn() and error() function.
 * @returns {object} Intermediate data for use with Level2Radar
 */
const parseData = (file, options, callback) => {
	const rafCompressed = new RandomAccessFile(file, BIG_ENDIAN);
	const data = [];

	// decompress file if necessary, returns original file if no compression exists
	decompress(rafCompressed, options.wholeOrPart, function(raf) {
		// read the file header
		const header = parseHeader(raf);
		if (document.getElementById('fileStation').innerHTML != header.ICAO) {
			document.getElementById('fileStation').innerHTML = header.ICAO;
		}

		let messageOffset31 = 0; // the current message 31 offset
		let recordNumber = 0; // the record number

		// Loop through all of the messages contained within the radar archive file. Save all the data we find to it's respective array.
		let r;
		let vcp = {};
		let hasGaps = false;
		let isTruncated = false;

		var iters = 0;

		// make sure there's more data, it's possible we're only decoding the header
		if (raf.getPos() < raf.getLength()) {
			do {
				try {
					r = Level2Record(raf, recordNumber, messageOffset31, header, options);
					recordNumber += 1;
				} catch (e) {
				// parsing error, report error then set this chunk as finished
					options.logger.warn(e);
					isTruncated = true;
					r = { finished: true };
				}

				if (!r.finished) {
					if (recordNumber % 200 == 0) {
						console.log('reading record ' + recordNumber);
						iters++;
						//ut.progressBarVal('set', ut.scale(iters, 0, 50, 75, 150));
					}
					if (r.message_type === 31) {
					// found a message 31 type, update the offset using an actual (from search) size if provided
						const messageSize = r.actual_size ?? r.message_size;
						// if actual_size is present set gaps flag
						hasGaps = true;
						messageOffset31 += (messageSize * 2 + 12 - RADAR_DATA_SIZE);
					}

					// only process specific message types
					if ([1, 5, 7, 31].includes(r.message_type)) {
					// If data is found, push the record to the data array
						if (r?.record?.reflect
						|| r?.record?.velocity
						|| r?.record?.spectrum
						|| r?.record?.zdr
						|| r?.record?.phi
						|| r?.record?.rho) data.push(r);

						if ([5, 7].includes(r.message_type)) vcp = r;
					}
				}
			} while (!r.finished);
		}
		document.getElementById('spinnerParent').style.display = 'none';

		// sort and group the scans by elevation asc
		callback(groupAndSortScans(data), header, vcp, isTruncated, hasGaps);
		// return {
		// 	data: groupAndSortScans(data),
		// 	header,
		// 	vcp,
		// 	isTruncated,
		// 	hasGaps,
		// };
	});
};

// This takes the scans (aka sweeps) and groups them
// by their elevation numbers.
const groupAndSortScans = (scans) => {
	const groups = [];

	// map the scans
	scans.forEach((scan) => {
		const { elevation_number: elevationNumber } = scan.record;

		/**
		 * If the group has already been created
		 * just push the current scan into the array
		 * or create a new group for the elevation
		 */
		if (groups[elevationNumber]) {
			groups[elevationNumber].push(scan);
		} else {
			groups[elevationNumber] = [scan];
		}
	});

	return groups;
};

module.exports = parseData;
