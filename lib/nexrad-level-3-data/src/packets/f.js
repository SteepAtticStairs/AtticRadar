const code = 15;
const description = 'Special Graphic Symbol Packet';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// parse the data
	const result = {
		symbols: [],
	};
	const endPos = raf.getPos() + lengthOfBlock;
	while (raf.getPos() < endPos) {
		result.symbols.push({
			iStartingPoint: raf.readShort(),
			jStartingPoint: raf.readShort(),
			text: raf.readString(2),
		});
	}
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
