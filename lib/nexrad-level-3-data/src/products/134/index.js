const code = 134;
const abbreviation = ['DVL'];
const description = 'Vertically Integrated Liquid';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => ({
	halfwords27_28: data,
});

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		plot: {
			linScale: raf.readShort(),
			linOffset: raf.readShort(),
			logStart: raf.readShort(),
			logScale: raf.readShort(),
			logOffset: raf.readShort(),
		},
		dependent36_46: raf.read(22),
		maxDigitalVIL: raf.readShort(),
		numArtifactEditedRadials: raf.readShort(),
		dependent49_50: raf.read(4),
		compressionMethod: raf.readShort(),
		uncompressedProductSize: (raf.readUShort() << 16) + raf.readUShort(),
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
};
