// format the text data provided
// extract data from lines that follow this format
// "        U3               0                   50                <0.50            "
// using this header information
// " CIRC  AZRAN   SR STM |-LOW LEVEL-|  |--DEPTH--|  |-MAX RV-| TVS  MOTION   MSI  "
// "  ID   deg/nm     ID  RV   DV  BASE  kft STMREL%  kft    kts     deg/kts        "
// returns an array of objects

module.exports = (data) => {
	// extract relevant data
	const pages = data?.tabular?.pages;
	if (!pages) return {};
	const result = {};

	// format line by line
	pages.forEach((page) => {
		page.forEach((line) => {
			// extrat values
			const rawMatch = line.match(/ +([0-9.]+) +([0-9.]+)\/ *([0-9.]+) +([0-9.]+) +([A-Z0-9]{2}) +([0-9.]+) +([0-9.]+)[ <]+([0-9.]+)[ <>]+([0-9.]+)[ <>]+([0-9.]+)[ <>]+([0-9.]+)[ <>]+([0-9.]+) +([YN]) {1,4}([0-9.]*)\/* {0,3}([0-9.]*) +([0-9.]*)/);
			if (!rawMatch) return;

			// format the result
			const [, id, az, ran, sr, stmId, llRv, llDv, llBase, depthKft, depthStmrel, maxRvKft, maxrvKts, tvs, motionDeg, motionKts, msi] = [...rawMatch];
			// check for motion
			let motion = false;
			if (motionDeg !== '') {
				motion = {
					deg: +motionDeg,
					kts: +motionKts,
				};
			}
			// store to array
			result[id] = {
				az: +az,
				ran: +ran,
				sr: +sr,
				stmId,
				lowLevel: {
					rv: +llRv,
					dv: +llDv,
					base: +llBase,
				},
				depth: {
					kft: +depthKft,
					stmrel: +depthStmrel,
				},
				maxRv: {
					kft: +maxRvKft,
					kts: +maxrvKts,
				},
				tvs: tvs === 'Y',
				motion,
				msi: msi ?? null,
			};
		});
	});

	return {
		mesocyclone: result,
	};
};
