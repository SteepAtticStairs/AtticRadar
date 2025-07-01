const parseMessageHeader = require('./message');
const { parse: parseProductDescription } = require('./productdescription');

const parse = (raf, product) => {
	const blockDivider = raf.readShort();
	const blockId = raf.readShort();
	const blockLength = raf.readInt();

	// test some known values
	if (blockDivider !== -1) throw new Error(`Invalid tabular block divider: ${blockDivider}`);
	if (blockId !== 3) throw new Error(`Invalid tabular id: ${blockId}`);
	if (blockLength < 1 || blockLength > 65535) throw new Error(`Invalid block length ${blockLength}`);
	if ((blockLength + raf.getPos() - 8) > raf.getLength()) throw new Error(`Block length ${blockLength} overruns file length for block id: ${blockId}`);

	const messageHeader = parseMessageHeader(raf);
	const productDescription = parseProductDescription(raf, product);
	const blockDivider2 = raf.readShort();

	// test some known values
	if (blockDivider2 !== -1) throw new Error(`Invalid second tabular block divider: ${blockDivider2}`);

	const result = {
		messageHeader,
		productDescription,
		totalPages: raf.readShort(),
		charactersPerLine: raf.readShort(),
		pages: [],
	};

	// loop through data until end of page reached
	for (let i = 0; i < result.totalPages; i += 1) {
		// page string
		const lines = [];
		let line = '';
		// loop through lines until end of page reached
		// read two characters at a time to detect end of page
		let chars = raf.readShort();
		while (chars !== -1) {
			// not in specification, but appears to be a line ending
			if (chars !== 0x0050) {
				// write the first character to the line
				line += String.fromCharCode(chars >> 8);
				// test length
				if (line.length % result.charactersPerLine === 0) { lines.push(line); line = ''; }
				// write the first character to the line
				line += String.fromCharCode(chars & 0x00FF);
				// test length
				if (line.length % result.charactersPerLine === 0) { lines.push(line); line = ''; }
			}
			// get next characters
			chars = raf.readShort();
		}
		result.pages.push(lines);
	}

	return result;
};

//

module.exports = parse;
