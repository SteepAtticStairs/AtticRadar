const code = 6;
const description = 'Linked Vector Packet';

// i and j = -2048 < i,j < 2047

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		iStartingPoint: raf.readShort(),
		jStartingPoint: raf.readShort(),
		vectors: [],
	};
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// calculate end byte (off by 4 from starting point)
	const endByte = raf.getPos() + lengthOfBlock - 4;

	// read vectors for length of packet
	while (raf.getPos() < endByte) {
		// read start and end coordinate pairs per vector
		result.vectors.push({
			i: raf.readShort(),
			j: raf.readShort(),
		});
	}

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
