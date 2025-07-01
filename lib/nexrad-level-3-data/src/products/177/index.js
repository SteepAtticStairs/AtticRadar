const code = 177;
const abbreviation = 'HHC';
const description = 'Hybrid Hydrometeor Classification';
const { RandomAccessFile } = require('../../randomaccessfile');

// uses the same data coding as 165
const { key } = require('../165').supplemental;

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => ({
	halfwords27_28: data,
});

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		dependent30_46: raf.read(34),
		modeFilter: raf.readShort(),
		hybridRatePercentBinsFilled: raf.readShort() / 100,
		highestElevation: raf.readShort() / 10,
		dependent50: raf.read(2),
		compressionMethod: raf.readShort(),
		uncompressedSize: (raf.readUShort() << 16) + raf.readUShort(),
		plot: { maxDataValue: 150 },
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
	supplemental: { key },
};
