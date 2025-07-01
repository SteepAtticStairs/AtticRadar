const code = 80;
const abbreviation = 'NTP';
const description = 'Storm Total Rainfall Accumulation';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	raf.seek(34);
	return {
		maxRainfall: raf.readShort() / 10,
		beginRanifallDate: raf.readShort(),
		beginRainfallMinutes: raf.readShort(),
		endRanifallDate: raf.readShort(),
		endRainfallMinutes: raf.readShort(),
		meanFieldBias: raf.readShort() / 100,
		sampleSize: raf.readShort() / 100,
		plot: {
			maxDataValue: 16,
		},
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords30_53,
	},
};
