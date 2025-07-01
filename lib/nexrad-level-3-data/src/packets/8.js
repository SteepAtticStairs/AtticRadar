const code = 8;
const description = 'Text and Special Symbol Packets';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// parse the data
	const result = {
		color: raf.readShort(),
		iStartingPoint: raf.readShort(),
		jStartingPoint: raf.readShort(),
	};
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read the result length
	result.text = raf.readString(lengthOfBlock - 6);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
