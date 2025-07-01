const { parser } = require('../packets');
const graphic22 = require('./graphic22');

const parse = (raf) => {
	const blockDivider = raf.readShort();
	// for product 62 the block divider is not present and is a packet code 22
	if (blockDivider === 22) {
		// jump back to allow full parsing of packet
		raf.skip(-2);
		// call the special packet 22 parser
		return graphic22(raf);
	}

	const blockId = raf.readShort();
	const blockLength = raf.readInt();

	// test some known values
	if (blockDivider !== -1) throw new Error(`Invalid graphic block divider: ${blockDivider}`);
	if (blockId !== 2) throw new Error(`Invalid graphic id: ${blockId}`);
	if (blockLength < 1 || blockLength > 65535) throw new Error(`Invalid block length ${blockLength}`);
	if ((blockLength + raf.getPos() - 8) > raf.getLength()) throw new Error(`Block length ${blockLength} overruns file length for block id: ${blockId}`);

	const numberPages = raf.readShort();

	const packets = [];

	if (numberPages < 1 || numberPages > 48 - 1) throw new Error(`Invalid graphic number of pages: ${numberPages}`);

	// read each page
	for (let pageNum = 0; pageNum < numberPages; pageNum += 1) {
		const pageNumber = raf.readShort();
		const pageLength = raf.readShort();

		// calculate end byte
		const endByte = raf.getPos() + pageLength;

		// test page number
		if (pageNum + 1 !== pageNumber) throw new Error(`Invalid page number: ${pageNumber}`);

		// loop through all packets
		while (raf.getPos() < endByte) {
			packets.push(parser(raf));
		}
	}

	return packets;
};

//

module.exports = parse;
