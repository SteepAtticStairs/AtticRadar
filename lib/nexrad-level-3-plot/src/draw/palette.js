// pallette utilities

// generate a palette as rgb[a](r,g,b)
// input can be rgb (3) or rgba (4) palette[] elements per color
// output can be structured the same as input
// input can consist of an array where each 3/4 elements represents a color
// or an object {colors: [r1,g1,b1,r2,g2,b2,...], thresholds: [t1,t2]}
// all values less than the threshold at index 0 will receive the set of colors at index zero
const generate = (palette, _options) => {
	// combine options with defaults
	const options = {
		inSize: 3,
		outSize: 4,
		..._options,
	};

	// grab the color values
	const colors = palette.colors ?? palette;

	// expand the colors to css format
	const rgbColors = [];
	for (let i = 0; i < colors.length; i += options.inSize) {
		const color = colors.slice(i, i + options.inSize);
		if (options.outSize === 3) rgbColors.push(`rgb(${color[0]},${color[1]},${color[2]})`);
		if (options.outSize === 4) rgbColors.push(`rgba(${color[0]},${color[1]},${color[2]},${(color[3] ?? 255) / 255})`);
	}

	// if no thresholds were provided, return
	if (!palette.thresholds) return rgbColors;
	// expand the palette following thresholds
	const expanded = [];
	let currentThreshold = 0;
	for (let i = 0; i < 256; i += 1) {
		// test for next threshold
		if (i > palette.thresholds[currentThreshold]) {
			currentThreshold += 1;
		}
		// add value to array
		expanded.push(rgbColors[currentThreshold]);
	}
	return expanded;
};

module.exports = {
	generate,
};
