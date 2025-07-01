const code = 12;
const description = 'Tornado Vortex Signautre';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const lengthOfBlock = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		points: [],
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// read all special symbols
	let i = 0;
	for (i = 0; (i < lengthOfBlock) && (i + 4 <= lengthOfBlock); i += 4) {
		const iStartingPoint = raf.readShort();
		const jStartingPoint = raf.readShort();
		result.points.push({
			iStartingPoint,
			jStartingPoint,
		});
	}

	// skip past extra data
	raf.skip(result.lengthOfBlock - i);

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
