const { MESSAGE_HEADER_SIZE } = require('../constants');

// parse message type 31
module.exports = (raf, message, offset, options) => {
	const record = {
		id: raf.readString(4),
		mseconds: raf.readInt(),
		julian_date: raf.readShort(),
		radial_number: raf.readShort(),
		azimuth: raf.readFloat(),
		compress_idx: raf.readByte(),
		sp: raf.readByte(),
		radial_length: raf.readShort(),
		ars: raf.readByte(),
		rs: raf.readByte(),
		elevation_number: raf.readByte(),
		cut: raf.readByte(),
		elevation_angle: raf.readFloat(),
		rsbs: raf.readByte(),
		aim: raf.readByte(),
		dcount: raf.readShort(),
	};

	// basic data integrity check
	try {
		if (!record.id.match(/[A-Z]{4}/)) throw new Error(`Invalid record id: ${record.id}`);
		if (record.mseconds > 86401000) throw new Error(`Invalid timestamp (ms): ${record.mseconds}`); // account for leap second
	} catch (e) {
		// return the un-altered message
		options.logger.warn(e.message);
		return message;
	}
	message.record = record;

	/**
	 * Read and save the data pointers from the file
	 * so we know where to start reading within the file
	 * to grab the data from the data blocks
	 * See page 114 of https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
	const dbp = [];
	for (let i = 0; i < 9; i += 1) {
		const pointer = raf.readInt();
		if (i < message.record.dcount) dbp.push(pointer);
	}

	/**
	 * Parse all of our data inside the datablocks
	 * and save it to the message.record Object
	 */

	// block type to friendly name conversion
	const blockTypesFriendly = {
		VOL: 'volume',
		ELE: 'elevation',
		RAD: 'radial',
		REF: 'reflect',
		VEL: 'velocity',
		'SW ': 'spectrum',	// intentional space to fill 3-character requirement
		ZDR: 'zdr',
		PHI: 'phi',
		RHO: 'rho',
	};

	// convert halfwords to bytes for message size
	const messageSizeBytes = message.message_size * 2;

	// hold a previous data block until the next data block is verified as valid
	let prevRecord = false;
	let prevBlockStart = 0;
	// process blocks, the order of the blocks is not guaranteed so the name must be used to select proper parser
	for (let i = 0; i < dbp.length; i += 1) {
		// jump to record position
		const parserStartPos = dbp[i] + offset + MESSAGE_HEADER_SIZE;
		raf.seek(parserStartPos);

		try {
			const { name } = blockName(raf);
			// no error was thrown, store the previous record
			if (prevRecord && blockTypesFriendly[prevRecord.name]) {
				// store the record under a friendly name
				message.record[blockTypesFriendly[prevRecord.name]] = prevRecord;
			}
			// reset the previous record
			prevRecord = false;

			// length check
			if (dbp[i] < messageSizeBytes) {
			// get the record based on known block names
				let thisRecord = false;
				switch (name) {
				case 'VOL':
					thisRecord = parseVolumeData(raf);
					break;
				case 'ELV':
					thisRecord = parseElevationData(raf);
					break;
				case 'RAD':
					thisRecord = parseRadialData(raf);
					break;
				default:
					thisRecord = parseMomentData(raf);
				}
				// store returned value for validation checking on next block
				prevRecord = thisRecord;
			} else {
				throw new Error(`Block overruns file at ${raf.getPos()}`);
			}
			// store the previous block position since this block was ok
			prevBlockStart = parserStartPos;
		} catch (e) {
			options.logger.warn(e.message);
			// clear out the previous record
			prevRecord = false;

			// set flag to search for next block
			message.endedEarly = prevBlockStart;
			break;
		}
	}

	// we can't yet check the integrity of the last block so we'll just accept that it's correct for now
	if (prevRecord && blockTypesFriendly[prevRecord.name]) {
		// store the record under a friendly name
		message.record[blockTypesFriendly[prevRecord.name]] = prevRecord;
	}

	return message;
};

/**
 * Creates a new parser and grabs the data
 * from the data blocks. Then save that data
 * to the record.volume Object
 * See page 114; Section "Data Block #1" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
 *
 * @param raf
 */
const parseVolumeData = (raf) => ({
	block_type: raf.readString(1),
	name: raf.readString(3),
	size: raf.readShort(),
	version_major: raf.read(),
	version_minor: raf.read(),
	latitude: raf.readFloat(),
	longitude: raf.readFloat(),
	elevation: raf.readShort(),
	feedhorn_height: raf.readShort(),
	calibration: raf.readFloat(),
	tx_horizontal: raf.readFloat(),
	tx_vertical: raf.readFloat(),
	differential_reflectivity: raf.readFloat(),
	differential_phase: raf.readFloat(),
	volume_coverage_pattern: raf.readShort(),
	processing_status: raf.readShort(),
	zdr_bias_estimate: raf.readShort(),
});

/**
 * Creates a new parser and grabs the data
 * from the data blocks. Then save that data
 * to the record.elevation Object
 * See page 114; Section "Data Block #2" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
 *
 * @param raf
 */
const parseElevationData = (raf) => ({
	block_type: raf.readString(1),
	name: raf.readString(3),
	size: raf.readShort(),
	atmos: raf.readShort(),
	calibration: raf.readFloat(),
});

/**
 * Creates a new parser and grabs the data
 * from the data blocks. Then save that data
 * to the record.radial Object
 * See page 115; Section "Data Block #3" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
 *
 * @param raf
 */
const parseRadialData = (raf) => ({
	block_type: raf.readString(1),
	name: raf.readString(3),
	size: raf.readShort(),
	unambiguous_range: raf.readShort() / 10,
	horizontal_noise_level: raf.readFloat(),
	vertical_noise_level: raf.readFloat(),
	nyquist_velocity: raf.readShort(),
	radial_flags: raf.readShort(),
	horizontal_calibration: raf.readFloat(),
	vertical_calibration: raf.readFloat(),
});

/**
 * Creates a new parser and grabs the data
 * from the data blocks. Then save that data
 * to the record.(reflect|velocity|spectrum|zdr|phi|rho)
 * Object base on what type being parsed
 * See page 115-117; Section "Data Block #4-9" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
 *
 * @param raf
 */
const parseMomentData = (raf) => {
	// initial offset for moment data
	const data = {
		block_type: raf.readString(1),
		name: raf.readString(3),
		spare: raf.read(4),
		gate_count: raf.readShort(),
		first_gate: raf.readShort() / 1000, // scale int to float 0.001 precision
		gate_size: raf.readShort() / 1000, // scale int to float 0.001 precision
		rf_threshold: raf.readShort() / 10, // scale int to float 0.1 precision
		snr_threshold: raf.readShort() / 1000, // scale int to float 0.001 precision
		control_flags: raf.read(),
		data_size: raf.read(),
		scale: raf.readFloat(),
		offset: raf.readFloat(),
		moment_data: [],
	};

	// allow for different sized data blocks
	let getDataBlock = raf.read.bind(raf);
	let inc = 1;
	if (data.data_size === 16) {
		getDataBlock = raf.readShort.bind(raf);
		inc = 2;
	}

	// const endI = data.gate_count * inc + MESSAGE_HEADER_SIZE;
	const endI = data.gate_count * inc;

	// raf.skip(MESSAGE_HEADER_SIZE);
	for (let i = 0; i < endI; i += inc) {
		const val = getDataBlock();
		// per documentation 0 = below threshold, 1 = range folding
		if (val >= 2) {
			data.moment_data.push((val - data.offset) / data.scale);
		} else {
			data.moment_data.push(null);
		}
	}
	return data;
};

// return the block name and return the pointer to the begining of the block
// return false if "D" is not present at byte 0
const blockName = (raf) => {
	// get data
	const type = raf.readString(1);
	const name = raf.readString(3);

	// skip back
	raf.skip(-4);

	// basic data integrity check
	if (!(type === 'D' || type === 'R')) {
		throw new Error(`Invalid data block type: 0x${(type.charCodeAt(0) || 0).toString(16).padStart(2, '0')} at ${raf.getPos()}`);
	}
	return { name, type };
};
