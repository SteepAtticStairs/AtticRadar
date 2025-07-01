// parse data in the graphic area as packet 22 and related packets
const { parser } = require('../packets');

const parse22 = (raf) => {
	let result = {
		cells: {},
	};
	// there is no length header so we parse packets until we get a -1 divider
	let divider = raf.readShort();
	while (divider !== -1 && raf.getPos() < raf.getLength()) {
		raf.skip(-2);
		// add parsed data to result
		// parse the data
		const data = parser(raf);
		// one packet 22 (volume times) is returned, add it directly to the output
		if (data.volumeTimes) result = { ...result, ...data };
		// multiple packet 21 (cell data) are returned, add to existing cells
		if (!data.volumeTimes) result.cells = { ...result.cells, ...data };
		// test for end of file
		if (raf.getPos() < raf.getLength())	divider = raf.readShort();
	}

	// skip back final time if there's more data
	if (raf.getPos() < raf.getLength()) raf.skip(-2);
	return result;
};

module.exports = parse22;
