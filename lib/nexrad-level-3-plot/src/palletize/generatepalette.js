// generate a palette with the number of steps provided
const { createCanvas } = require('canvas');
const crypto = require('crypto');

const generatePalette = (_sourcePalette, steps, background, product) => {
	// get palette from either color array only or object with color array
	const sourcePalette = _sourcePalette.colors ?? _sourcePalette;
	// determine if work needs to be done or if the palette is workable
	// intentionally >= 256 to allow for one index to be used for the transparent value
	if (((sourcePalette.length / 3) * steps) >= 256) throw new Error('Invalid combination of source palette size and generate');
	if (sourcePalette.length % 3 !== 0) throw new Error('Source palette size must be a multiple of 3');
	if (sourcePalette.length > 255) throw new Error('No room for transparent value in source palette');

	const backgroundColor = getBackgroundColor(background);

	// generate a key from the options that uniquely identifies this palette for use with caching
	const keySource = JSON.stringify({
		startPalette: sourcePalette, steps, background, productCode: product.code,
	});
	const key = crypto.createHash('md5').update(keySource).digest('hex');

	// destination palette starts with the transparent index
	const palette = [backgroundColor[0], backgroundColor[1], backgroundColor[2], 0];

	// loop through the source palette
	for (let sourceIdx = 0; sourceIdx < sourcePalette.length / 3; sourceIdx += 1) {
		// loop through the steps, with steps = 0 this will only cause a copy
		for (let step = steps; step >= 0; step -= 1) {
			// calculate r,g,b,a values
			palette.push(calcIntermediate(sourcePalette[sourceIdx * 3 + 0], backgroundColor[0], step + 1, steps + 1));
			palette.push(calcIntermediate(sourcePalette[sourceIdx * 3 + 1], backgroundColor[1], step + 1, steps + 1));
			palette.push(calcIntermediate(sourcePalette[sourceIdx * 3 + 2], backgroundColor[2], step + 1, steps + 1));
			palette.push(calcIntermediate(255, 0, step + 1, steps + 1));
		}
	}

	return {
		palette,
		key,
	};
};

// get the background color by drawing a 1x1 pixel image
// this allows any form of color accepted by canvas.ctx to be used
const getBackgroundColor = (color) => {
	// make the canvas
	const canvas = createCanvas(1, 1);
	const ctx = canvas.getContext('2d');

	// fill the canvas
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);

	// get the color
	return ctx.getImageData(0, 0, 1, 1).data;
};

// calcaulate a value that is i.e. 1/3 of the way between a and b
// a = 12, b = 0, num = 1, den = 3 returns 4
// a = 20, b = 10, num = 1, den = 4 returns 12.5
const calcIntermediate = (a, b, num, den) => {
	const diff = a - b;
	return ((diff * num) / den + b);
};

module.exports = generatePalette;
