const code = 10;
const description = 'Unlinked Vector Packet';

// i and j = -2048 < i,j < 2047

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		color: raf.readShort(),
		vectors: [],
	};
	// also provide the packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// calculate end byte (off by 2 from result.color)
	const endByte = raf.getPos() + lengthOfBlock - 2;

	// read vectors for length of packet
	while (raf.getPos() < endByte) {
		// read start and end coordinate pairs per vector
		result.vectors.push({
			start: {
				i: raf.readShort(),
				j: raf.readShort(),

			},
			end: {
				i: raf.readShort(),
				j: raf.readShort(),
			},
		});
	}

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
