const code = 58;
const abbreviation = ['NST'];
const description = 'Storm Tracking Information';
const { RandomAccessFile } = require('../../randomaccessfile');
const formatter = require('./formatter');

// 248 Nmi, Geographic and Non-geographic alphanumeric

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	// turn data into a random access file for bytewise parsing purposes
	const raf = new RandomAccessFile(data);
	return {
		elevationAngle: raf.readShort() / 10,
		dependent31_46: raf.read(32),
		maxNegativeVelocity: raf.readShort(),	// knots
		maxPositiveVelocity: raf.readShort(),	// knots
		motionSourceFlag: raf.readShort(),	// = -1
		dependent50: raf.readShort(),
		averageStormSpeed: raf.readShort() / 10,	// knots
		averageStormDirection: raf.readShort() / 10, // degrees
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	formatter,

	productDescription: {
		halfwords30_53,
	},
};
