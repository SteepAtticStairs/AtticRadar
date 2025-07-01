// format the text data provided
// extract data from lines that follow this format
// "  P2     244/125   232/ 38     245/116   246/107   247/ 97   NO DATA    1.1/ 0.9"
// using this header information
// " STORM    CURRENT POSITION              FORECAST POSITIONS               ERROR  ",
// "  ID     AZRAN     MOVEMENT    15 MIN    30 MIN    45 MIN    60 MIN    FCST/MEAN",
// "        (DEG/NM)  (DEG/KTS)   (DEG/NM)  (DEG/NM)  (DEG/NM)  (DEG/NM)     (NM)   "
// returns an an arrya of objects {
// id: id of storm assigned by algorithm
// current: {deg,nm} current position from radar in degrees and nautical miles
// movement: {deg,kts} movement of storm in degrees and knots
// forecast: [{deg, nm},...] forecasted position of storm in degrees and nm from radar site at [15,30,45,60] minutes
// }

module.exports = (data) => {
	// extract relevant data
	const pages = data?.tabular?.pages;
	if (!pages) return {};
	const result = {};

	// format line by line
	pages.forEach((page) => {
		page.forEach((line) => {
			// look for ID and current position to find valid line
			const idMatch = line.match(/ {2}([A-Z][0-9]) {5}[0-9 ]{3}\/[0-9 ]{3} {3}/);
			if (!idMatch) return;

			// store the id
			const id = idMatch[1];

			// extract 6 positional values
			const rawPositions = [...line.matchAll(/([ 0-9]{3}\/[ 0-9]{3}|NO DATA| {2}NEW {2})/g)];
			// extract the matched strings and parse into objects
			// second string (index 1) is in knots
			const stringPositions = rawPositions.map((position, index) => parseStringPosition(position[1], index === 1));

			// format the result
			const [current, movement, ...forecast] = stringPositions;
			// store to array
			result[id] = {
				current, movement, forecast,
			};
		});
	});

	return {
		storms: result,
	};
};

// parse no data, new and positional info
// kts returns {deg,kts} instead of the default {deg,nm}
const parseStringPosition = (position, kts = false) => {
	// fixed strings
	if (position === 'NO DATA') return null;
	if (position === '  NEW  ') return 'new';

	// extract the two numbers
	const values = position.match(/([ 0-9]{3})\/([ 0-9]{3})/);
	// couldn't find two numbers
	if (!values) return undefined;
	// return the formatted numbers
	if (kts) {
		return {
			deg: +values[1],
			kts: +values[2],
		};
	}
	return {
		deg: +values[1],
		nm: +values[2],
	};
};
