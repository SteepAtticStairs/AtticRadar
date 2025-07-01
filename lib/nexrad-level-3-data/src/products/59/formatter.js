// format the text data provided
// extract data from lines that follow this format
// "        U3               0                   50                <0.50            "
// using this header information
// "      STORM       PROBABILITY OF       PROBABILITY OF       MAX EXPECTED        "
// "        ID        SEVERE HAIL (%)         HAIL (%)         HAIL SIZE (IN)       "
// returns an array of objects {
// id: id of storm assigned by algorithm
// probSevere: probability of severe hail %
// probHail: probability of hail %
// maxSize: max expected size of hail (read as <x.xx in)
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
};
