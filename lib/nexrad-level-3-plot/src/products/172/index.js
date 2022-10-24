const code = 172;
const abbreviation = 'DTA';
const description = 'Digital Total Accumulation';

const palette = {
	colors: [
		0, 0, 0,
		0, 10, 100,
		0, 50, 200,
		0, 80, 230,
		0, 110, 255,
		128, 224, 80,
		100, 184, 64,
		72, 144, 48,
		32, 104, 32,
		16, 64, 16,
		250, 240, 0,
		240, 128, 32,
		240, 16, 32,
		134, 0, 0,
		115, 0, 155,
		196, 42, 128,
		175, 0, 215,
		190, 190, 190,
		230, 230, 230,
		255, 255, 255,
	],
	thresholds: [8, 16, 24, 32, 40, 56, 72, 88, 104, 120, 136, 152, 168, 184, 200, 208, 216, 224, 232],
	baseScale: 2.56,
};

module.exports = {
	code,
	abbreviation,
	description,
	palette,
};
