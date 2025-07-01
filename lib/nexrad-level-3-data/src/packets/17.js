const code = 23;
const description = 'Special Graphic Symbol Packet';

const parser = (raf) => {
	// must require dynamically to avoid circular dependency when not yet fully executed
	// eslint-disable-next-line global-require
	const { parser: packetParser } = require('.');
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// parse the data as a series of packets
	const endPos = raf.getPos() + lengthOfBlock;
	const result = {
		packets: [],
	};
	while (raf.getPos() < endPos) {
		result.packets.push(packetParser(raf));
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
