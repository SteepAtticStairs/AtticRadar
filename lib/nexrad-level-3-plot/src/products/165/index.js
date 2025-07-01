const code = 165;
const abbreviation = ['N0H', 'N1H', 'N2H', 'N3H'];
const description = 'Hydrometeor Classification';

const palette = {
	colors: [
		0, 0, 0,
		127, 35, 35,
		118, 118, 118,
		255, 176, 176,
		235, 235, 235,
		0, 144, 255,
		0, 251, 144,
		0, 187, 0,
		208, 208, 96,
		210, 132, 132,
		255, 0, 0,
		255, 96, 0,
		255, 192, 0,
		231, 0, 255,
		119, 0, 255,
	],
	thresholds: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 140, 150, 160],
};

module.exports = {
	code,
	abbreviation,
	description,
	palette,
};
