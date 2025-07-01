const code = 172;
const abbreviation = 'DTA';
const description = 'Storm Total Precipitation';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		accumulationStartDate: raf.readShort(),
		accumulationStartMinutes: raf.readShort(),
	};
};

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		nullProductFlag: nullProductFlag(raf.readShort()),
		plot: {
			scale: raf.readFloat() * 100,
			offset: raf.readFloat(),
			dependent35: raf.readShort(),
			maxDataValue: raf.readShort(),
			leadingFlags: leadingFlags(raf.readShort()),
			trailingFlags: raf.readShort(),
		},
		dependent39_46: raf.read(16),
		maxAccumulation: raf.readShort() / 10,
		accumulationEndDate: raf.readShort(),
		accumulationEndMinutes: raf.readShort(),
		meanFieldBias: raf.readShort() / 1000,
		compressionMethod: raf.readShort(),
		uncompressedSize: (raf.readUShort() << 16) + raf.readUShort(),
	};
};

const nullProductFlag = (data) => {
	if (data === 0) return false;
	let reason = '';
	switch (data) {
	case 0:
		reason = false;
		break;
	case 1:
		reason = 'No accumulation available. Threshold: ‘Elapsed Time to Restart’ [TIMRS] xx minutes exceeded.';
		break;
	case 2:
		reason = 'No precipitation detected during the specified time span.';
		break;
	case 3:
		reason = 'No accumulation data available for the specified time span.';
		break;
	case 4:
		reason = 'No precipitation detected since hh:mmZ. Threshold: \'Time Without Precipitation for Resetting Storm Totals\' [RAINT] is xx minutes or No precipitation detected since RPG startup.';
		break;
	case 5:
		reason = 'No precipitation detected since hh:mmZ or No precipitation detected since RPG startup.';
		break;
	case 6:
		reason = 'No Top_of_Hour accumulation - Some problem encountered with the SQL query resulted in an error.';
		break;
	case 7:
		reason = 'No Top_of_Hour accumulation because of excessive missing time encountered.';
		break;
	default:
		reason = 'Undefined';
	}
	return {
		value: data,
		reason,
	};
};

const leadingFlags = (data) => ({
	noData: data & 0x01 === 0,
});

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
};
