/**
 * Function that takes all of the tabular pages in a storm tracks product, and creates a nicely-formatted object with the data.
 * The code is from netbymatt's "nexrad-level-3-data":
 * https://github.com/netbymatt/nexrad-level-3-data/blob/main/src/products/58/formatter.js
 * 
 * @param {*} pages An array with all of the tabular pages to parse. Each array element should be one page, with lines separated by "\n".
 * @returns {Object} An object with the formatted storm tracks.
 */
function format_storm_tracks(pages) {
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

    // extract relevant data
    // divide tabular data into lines
    pages = pages.map(i => i.split('\n'));
    if (!pages) return {};
    var result = {};

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
}

/**
 * Same as the first function, but for the NHI (Hail Index) product. The code can be found here:
 * https://github.com/netbymatt/nexrad-level-3-data/blob/main/src/products/59/formatter.js
 */
function format_hail_index(pages) {
    // extract relevant data
    // divide tabular data into lines
    pages = pages.map(i => i.split('\n'));
    if (!pages) return {};
    const result = {};

    // format line by line
    pages.forEach((page) => {
        page.forEach((line) => {
            // extrat values
            const rawMatch = line.match(/ {8}([A-Z]\d) {4} *([0-9.]{1,3}) *([0-9.]{1,3}) *<?>?([0-9.]{4,6}) */);
            if (!rawMatch) return;

            // format the result
            const [, id, probSevere, probHail, maxSize] = [...rawMatch];
            // store to array
            result[id] = {
                probSevere: +probSevere,
                probHail: +probHail,
                maxSize: +maxSize,
            };
        });
    });

    return {
		hail: result,
	};
}

/**
 * Same as the first function, but for the TVS (Tornado Vortex Signature) product. The code can be found here:
 * https://github.com/netbymatt/nexrad-level-3-data/blob/main/src/products/61/formatter.js
 */
function format_tornado_vortex_signature(pages) {
    // extract relevant data
    // divide tabular data into lines
    pages = pages.map(i => i.split('\n'));
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
}

/**
 * Same as first function, but for the NMD (Mesocyclone Detection) product. The code can be found here:
 * https://github.com/netbymatt/nexrad-level-3-data/blob/main/src/products/141/formatter.js
 */
function format_mesocyclone_detection(pages) {
    // extract relevant data
    // divide tabular data into lines
    pages = pages.map(i => i.split('\n'));
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
}

module.exports = {
    format_storm_tracks,
    format_hail_index,
    format_tornado_vortex_signature,
    format_mesocyclone_detection
};