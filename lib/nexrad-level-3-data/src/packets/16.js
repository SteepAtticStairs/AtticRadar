const code = 22;
const description = 'Cell Trend Data Packet';

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);

	// parse the data
	const numberVolumes = raf.readByte();
	// pointer is 1-based, shift to align with javascript 0-based array
	const latestVolumePointer = raf.readByte() - 1;
	const result = {
		volumeTimes: [],
	};

	// read the result length
	for (let i = 0; i < numberVolumes; i += 1) {
		result.volumeTimes.push(raf.readShort());
	}
	// reshuffle the array with the newest data first
	result.volumeTimes = [...result.volumeTimes.slice(latestVolumePointer + 1), ...result.volumeTimes.slice(0, latestVolumePointer + 1)].reverse();

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
