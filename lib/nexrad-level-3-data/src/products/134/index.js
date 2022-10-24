const code = 134;
const abbreviation = ['DVL'];
const description = 'Digital Vertically Integrated Liquid';
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
		dependent31_49: raf.read(38),
		...deltaTime(raf.readShort()),
		compressionMethod: raf.readShort(),
		uncompressedSize: (raf.readUShort() << 16) + raf.readUShort(),
		plot: { maxDataValue: 500 },
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
		halfwords27_28,
		halfwords30_53,
	},
};
