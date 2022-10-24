const code = 165;
const abbreviation = ['N0H', 'N1H', 'N2H', 'N3H'];
const description = 'Hydrometeor Classification';
const { RandomAccessFile } = require('../../randomaccessfile');

const key = {
	0: 'ND: Below Threshold',
	10: 'BI: Biological',
	20: 'GC: Anomalous Propagation/Ground Clutter',
	30: 'IC: Ice Crystals',
	40: 'DS: Dry Snow',
	50: 'WS: Wet Snow',
	60: 'RA: Light and/or Moderate Rain',
	70: 'HR: Heavy Rain',
	80: 'BD: Big Drops (rain)',
	90: 'GR: Graupel',
	100: 'HA: Hail, possibly with rain',
	110: 'LH: Large Hail',
	120: 'GH: Giant Hail',
	140: 'UK: Unknown Classification',
	150: 'RF: Range Folded',
};

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
		plot: { maxDataValue: 150 },
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
	supplemental: { key },
};
