const code = 159;
const abbreviation = [
	'N0X',
	'N1X',
	'N2X',
	'N3X',
];
const description = 'Digital Differential Reflectivity';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		plot: {
			scale: raf.readFloat(),
			offset: raf.readFloat(),
			dependent35: raf.readShort(),
			maxDataValue: raf.readShort(),
			leadingFlags: raf.readShort(),
			trailingFlags: raf.readShort(),
		},
		dependent39_46: raf.read(16),
		minDifferentialReflectivity: raf.readShort(),
		maxDifferentialReflectivity: raf.readShort(),
		dependent49: raf.read(2),
		...deltaTime(raf.readShort()),
		compressionMethod: raf.readShort(),
		uncompressedProductSize: (raf.readUShort() << 16) + raf.readUShort(),
	};
};

// delta and time are compressed into one field
const deltaTime = (value) => ({
	deltaTime: (value & 0xFFE0) >> 5,
	nonSupplementalScan: (value & 0x001F) === 0,
	sailsScan: (value & 0x001F) === 1,
	mrleScan: (value & 0x001F) === 2,
});

module.exports = {
	code,
	abbreviation,
	description,

	productDescription: {
		halfwords30_53,
	},
};
