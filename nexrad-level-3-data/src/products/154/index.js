const code = 154;
const abbreviation = [
	'N0G',
	'N1G',
	'N2G',
	'N3G',
];
const description = 'Hi-Res Base Velocity';
const { RandomAccessFile } = require('../../randomaccessfile');

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		plot: {
			minimumDataValue: raf.readShort() / 10,
			dataIncrement: raf.readShort() / 10,
			dataLevels: raf.readShort(),
		},
		dependent34_46: raf.read(26),
		maxReflectivity: raf.readShort(),	// dBZ
		dependent48_49: raf.read(4),
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
