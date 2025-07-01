const code = 21;
const description = 'Special Graphic Symbol Packet';
const { ijToAzDeg } = require('./utilities/ij');

// scaling data for each trend code
const trendCodeScale = [
	null,	// index zero is unused
	100.0,	// feet
	100.0, // feet
	100.0, // feet
	1.00, // %
	1.00, // %
	1.00, // kg/m^2
	1.00, // dBz
	100.0, // feet
];

// trend code meaning
const trendCodes = {
	1: 'Cell top, feet',
	2: 'Cell base, feet',
	3: 'Max ref height, feet',
	4: 'Probability of Hail, %',
	5: 'Probability of Severe Hail, %',
	6: 'Cell based VIL, kg/m^2',
	7: 'Max ref, dBz',
	8: 'Centroid height, feet',
};

const parser = (raf) => {
	// packet header
	const packetCode = raf.readUShort();
	const packetLength = raf.readShort();

	// test packet code
	if (packetCode !== code) throw new Error(`Packet codes do not match ${code} !== ${packetCode}`);
	const startPos = raf.getPos();
	const endPos = startPos + packetLength;

	// parse the data
	const cellId = raf.readString(2);
	const result = {
		iPosition: raf.readShort(),
		jPosition: raf.readShort(),
		trends: [],
	};

	// provide convenience conversions
	const converted = ijToAzDeg(result.iPosition, result.jPosition);
	result.nm = converted.nm;
	result.deg = converted.deg;

	// read the trend packet
	// end is calculated from length
	while (raf.getPos() < endPos) {
		const trendCode = raf.readShort();
		const numberVolumes = raf.readByte();
		// pointer is 1-based, shift to align with javascript 0-based array
		const latestVolumePointer = raf.readByte() - 1;

		const trend = {
			type: trendCodes[trendCode],
			data: [],
		};

		// add a friendly trend code name
		trend.type = trendCodes[trendCode];

		// read data for each volume and scale
		for (let j = 0; j < numberVolumes; j += 1) {
			let value = raf.readShort();
			// test codes 1 and 2 have a special considerating for scaling, subtract 1000 from values over 700
			if ([1, 2].includes(trendCode) && value > 700) value -= 1000;
			trend.data.push(value * trendCodeScale[trendCode]);
		}
		// reshuffle the array with the newest data first
		trend.data = [...trend.data.slice(latestVolumePointer + 1), ...trend.data.slice(0, latestVolumePointer + 1)].reverse();

		// index trends by code
		result.trends[trendCode] = trend;
	}

	return { [cellId]: result };
};

module.exports = {
	code,
	description,
	parser,
};
