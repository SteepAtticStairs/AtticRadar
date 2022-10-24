const code = 0xaf1f;
const description = 'Radial Data Packet (16 Data Levels)';
const rle = require('./utilities/rle');

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const result = {
		firstBin: raf.readShort(),
		numberBins: raf.readShort(),
		iSweepCenter: raf.readShort(),
		jSweepCenter: raf.readShort(),
		rangeScale: raf.readShort() / 1000,
		numRadials: raf.readShort(),
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// loop through the radials and bins
	// return a structure of [radial][bin]
	const radials = [];
	for (let r = 0; r < result.numRadials; r += 1) {
		// get the rle length
		const rleLength = raf.readShort() * 2;
		const radial = {
			startAngle: raf.readShort() / 10,
			angleDelta: raf.readShort() / 10,
			bins: [],
		};
		for (let i = 0; i < rleLength; i += 1) {
			radial.bins.push(...(rle.expand4_4(raf.readByte())));
		}
		radials.push(radial);
	}
	result.radials = radials;

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
