// format the text data provided
// extract data from lines that follow this format
// "  TVS    F0    74/ 52    35    52    52/ 4.9   >11.1  < 4.9/ 16.0    16/ 4.9    "
// using this header information
// " Feat  Storm   AZ/RAN  AVGDV  LLDV  MXDV/Hgt   Depth    Base/Top   MXSHR/Hgt    "
// " Type    ID   (deg,nm)  (kt)  (kt)  (kt,kft)   (kft)     (kft)     (E-3/s,kft)  "
// returns an array of objects {
// type: feature type
// id: id of storm assigned by algorithm
// az: azimuth
// range: range to storm
// avgdv
// lldv
// mxdv
// mxdvhgt
// depth
// base
// top
// maxshear
// maxshearheight
// }

module.exports = (data) => {
	// extract relevant data
	const pages = data?.tabular?.pages;
	if (!pages) return {};
	const result = {};

	// format line by line
	pages.forEach((page) => {
		page.forEach((line) => {
			// extrat values
			const rawMatch = line.match(/ {2}([A-Z0-9]{3}) {4}([A-Z][0-9]) {3,5}([0-9.]{1,3})\/ {0,2}([0-9.]{1,3}) {3,5}([0-9.]{1,3}) {3,5}([0-9.]{1,3}) {3,5}([0-9.]{1,3})\/ {0,2}([0-9.]{1,3})[ <>]{4}([0-9.]{4})[ <>]{3,4}([0-9.]{3,4})\/ {0,2}([0-9.]{1,4}) {3,5}([0-9.]{2,4})\/ {0,2}([0-9.]{1,4})/);
			if (!rawMatch) return;

			// format the result
			const [, type, id, az, range, avfdv, lldv, mxdv, mvdvhgt, depth, base, top, maxshear, maxshearheight] = [...rawMatch];
			// store to array
			result[id] = {
				type,
				az: +az,
				range: +range,
				avfdv: +avfdv,
				lldv: +lldv,
				mxdv: +mxdv,
				mvdvhgt: +mvdvhgt,
				depth: +depth,
				base: +base,
				top: +top,
				maxshear: +maxshear,
				maxshearheight: +maxshearheight,
			};
		});
	});

	return {
		tvs: result,
	};
};
