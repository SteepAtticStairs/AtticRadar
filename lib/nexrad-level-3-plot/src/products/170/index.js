const code = 170;
const abbreviation = 'DAA';
const description = 'Digital One Hour Accumulation';

// same colors as 172
const { colors } = require('../172').palette;

const palette = {
	colors,
	thresholds: [1, 2, 4, 6, 9, 11, 21, 32, 43, 64, 58, 128, 170, 213, 255],

	baseScale: 6.0,
};

module.exports = {
	code,
	abbreviation,
	description,
	palette,
};
