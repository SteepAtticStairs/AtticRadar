const {
	FILE_HEADER_SIZE, RADAR_DATA_SIZE, CTM_HEADER_SIZE,
} = require('../constants');

// message parsers
const parseMessage1 = require('./Level2Record-1');
const parseMessage2 = require('./Level2Record-2');
const parseMessage31 = require('./Level2Record-31');
const parseMessage5 = require('./Level2Record-5-7');
const { level2RecordSearch } = require('./Level2RecordSearch');

/**
 * Read a single record from the radar data
 *
 * @class Level2Record
 * @param {RandomAccessFile} raf Random access file
 * @param {number} record Record number
 * @param {number} message31Offset Additional record offset caused by message 31 size
 * @param {Header} header Original parsed file header
 * @param {ParserOptions} [options] Parser options
 * @returns {object} Variable data based on message types present in record
 */
const Level2Record = (raf, record, message31Offset, header, options) => {
	// calculate header size if not provided (typically in chunks mode)
	let headerSize = 0;
	if (header?.ICAO) headerSize = FILE_HEADER_SIZE;

	const recordOffset = record * RADAR_DATA_SIZE + headerSize + message31Offset;

	// passed the buffer, finished reading the file
	if (recordOffset >= raf.getLength()) return { finished: true };

	// return the current record data
	const message = getRecord(raf, recordOffset, options);

	// test for early termination flag
	if (!message.endedEarly) return message;

	// start a search for the next message
	const nextRecordPos = level2RecordSearch(raf, message.endedEarly, header?.modified_julian_date, options);
	if (nextRecordPos === false) {
		throw new Error(`Unable to recover message at ${recordOffset}`);
	}
	message.actual_size = (nextRecordPos - recordOffset) / 2 - CTM_HEADER_SIZE;
	return message;
};

const getRecord = (raf, recordOffset, options) => {
	raf.seek(recordOffset);
	raf.skip(CTM_HEADER_SIZE);

	const message = {
		message_size: raf.readShort(),
		channel: raf.readByte(),
		message_type: raf.readByte(),
		id_sequence: raf.readShort(),
		message_julian_date: raf.readShort(),
		message_mseconds: raf.readInt(),
		segment_count: raf.readShort(),
		segment_number: raf.readShort(),
	};

	switch (message.message_type) {
	case 31: return parseMessage31(raf, message, recordOffset, options);
	case 1: return parseMessage1(raf, message, options);
	case 2: return parseMessage2(raf, message);
	case 5:
	case 7: return parseMessage5(raf, message);
	default: return false;
	}
};

module.exports.Level2Record = Level2Record;
