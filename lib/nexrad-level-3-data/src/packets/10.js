const code = 16;
const description = 'Digital Radial Data Array Packet';

// https://github.com/Unidata/MetPy/blob/main/src/metpy/io/nexrad.py#L702
function float16(val) {
    //Convert a 16-bit floating point value to a standard Javascript float.
    // Fraction is 10 LSB, Exponent middle 5, and Sign the MSB
    var frac = val & 0x03ff
    var exp = (val >> 10) & 0x1F
    var sign = val >> 15

    var value;
    if (exp) {
        value = 2 ** (exp - 16) * (1 + parseFloat(frac) / 2**10)
    } else {
        value = parseFloat(frac) / 2**9
    }

    if (sign) {
        value *= -1
    }

    return value
}

const parser = (raf, productDescription) => {
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
		numberRadials: raf.readShort(),
	};
	// also providethe packet code in hex
	result.packetCodeHex = packetCode.toString(16);

	// set up scaling or defaults
	const scaling = {
		scale: productDescription?.plot?.scale ?? 1,
		offset: productDescription?.plot?.offset ?? 0,
	};

	// create a lookup table mapping raw bin values to scaled values
	const scaled = [];
	let start = 0;
	// if a plot object is defined add scaling options
	if (productDescription?.plot?.leadingFlags?.noData === 0) {
		start = 1;
		scaled[0] = null;
	}
	if (productDescription?.plot?.maxDataValue !== undefined) {
		// added by steepatticstairs
		// below threshold
		scaled[0] = null;
		// range folded
		scaled[1] = -999;
		for (let i = start + 2; i <= productDescription.plot.maxDataValue; i += 1) {
			scaled.push(((i - scaling.offset) / scaling.scale));
		}
	} else if (productDescription?.plot?.dataLevels !== undefined) {
		// below threshold
		scaled[0] = null;
		// range folded
		scaled[1] = -999;
		for (let i = 2; i <= productDescription.plot.dataLevels; i += 1) {
			scaled[i] = productDescription.plot.minimumDataValue + (i * productDescription.plot.dataIncrement);
		}
	} else if (productDescription?.plot?.logStart !== undefined) {
		// scaling for vertically integrated liquid
		var linScale = float16(productDescription.plot.linScale); // hw31
		var linOffset = float16(productDescription.plot.linOffset); // hw32
		var logStart = productDescription.plot.logStart; // hw33
		var logScale = float16(productDescription.plot.logScale); // hw34
		var logOffset = float16(productDescription.plot.logOffset); // hw35

		// VIL is allowed to use 2 through 254 inclusive. 0 is thresholded,
        // 1 is flagged, and 255 is reserved
		scaled[0] = null;
		scaled[1] = 0.0;
		for (let i = 2; i <= 254; i += 1) {
			if (i < logStart) {
				scaled[i] = (i - linOffset) / linScale;
			} else if (i >= logStart) {
				scaled[i] = Math.exp((i - logOffset) / logScale)
			}
		}
	}

	// loop through the radials and bins
	// return a structure of [radial][bin]
	// radials provides scaled values per the product's scaling, radialsRaw provides bytes as read from the file
	const radials = [];
	const radialsRaw = [];
	for (let r = 0; r < result.numberRadials; r += 1) {
		const bytesInRadial = raf.readShort();
		const radial = {
			startAngle: raf.readShort() / 10,
			angleDelta: raf.readShort() / 10,
			bins: [],
		};
		const radialRaw = { ...radial, bins: [] };
		for (let i = 0; i < result.numberBins; i += 1) {
			const value = raf.readByte();
			radial.bins.push(scaled[value]);
			radialRaw.bins.push(value);
		}
		radials.push(radial);
		radialsRaw.push(radialRaw);
		// must end on a halfword boundary, skip any additional data if required
		if (bytesInRadial !== result.numberBins) raf.skip(bytesInRadial - result.numberBins);
	}
	result.radials = radials;
	result.radialsRaw = radialsRaw;

	return result;
};

module.exports = {
	code,
	description,
	parser,
};
