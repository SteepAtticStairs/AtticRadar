const code = 141;
const abbreviation = ['NMD'];
const description = 'Mesocyclone';
const formatter = require('./formatter');
const { RandomAccessFile } = require('../../randomaccessfile');

// 124 Nmi, Geographic and Non-geographic alphanumeric

// eslint-disable-next-line camelcase
const halfwords27_28 = (data) => {
	const raf = new RandomAccessFile(data);
	return {
		minimumReflectivity: raf.readShort(),
		overlapDisplayFilter: raf.readShort(),
	};
};

// eslint-disable-next-line camelcase
const halfwords30_53 = (data) => {
	const raf = new RandomAccessFile(data);
	return {
		filterStrengthRank: raf.readShort(),
	};
};

module.exports = {
	code,
	abbreviation,
	description,
	formatter,
	productDescription: {
		halfwords27_28,
		halfwords30_53,
	},
};
