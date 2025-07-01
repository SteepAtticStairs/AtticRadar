// run length encoding expansion methods

// expand rle from rrrrvvvv, 4-bit run, 4-bit value
// eslint-disable-next-line camelcase
const expand4_4 = (byte) => {
	const run = byte >> 4;
	const value = byte & 0x0F;
	const result = [];
	for (let i = 0; i < run; i += 1) {
		result.push(value);
	}
	return result;
};

module.exports = {
	expand4_4,
};
