// palletize an image
const { createCanvas } = require('canvas');
const generatePalette = require('./generatepalette');
const closest = require('./closest');
const { DEFAULT_OPTIONS: DRAW_DEFAULT_OPTIONS } = require('../draw');

// default options
const DEFAULT_OPTIONS = {
	generate: 0,
	palette: [],
};

const palletize = (sourceCtx, _product, _options) => {
	// create a copy of the product to ensure no data is written back to the product and used on subsequent calls
	const product = _product;
	// combine options and defaults
	const options = combineOptions(_options, product);

	// always call the generate palette function
	// it will return a key for caching purposes and add the necessary transparent index
	const { palette, key } = generatePalette(options.palletize.palette, options.palletize.generate, options.background, product);

	// get original image data
	const sourceImageData = sourceCtx.getImageData(0, 0, options.size, options.size);

	// create indexed canvas
	const indexedCanvas = createCanvas(options.size, options.size);
	const indexedCtx = indexedCanvas.getContext('2d', { pixelFormat: 'A8' });
	const indexedImageData = indexedCtx.getImageData(0, 0, options.size, options.size);

	// loop through each pixel
	indexedImageData.data.forEach((val, idx) => {
		indexedImageData.data[idx] = closest(sourceImageData.data.slice(idx * 4, idx * 4 + 3), palette, key);
	});

	// write new data
	indexedCtx.putImageData(indexedImageData, 0, 0);

	// attach palette and return
	indexedCanvas.palette = new Uint8ClampedArray(palette);
	return indexedCanvas;
};

// manually combine options
const combineOptions = (_options, product) => {
	const options = _options;
	if (typeof _options.palletize === 'boolean') {
		// use all defaults
		options.palletize = { ...DEFAULT_OPTIONS };
	} else {
		// combine provided options with defaults
		options.palletize = { ...DEFAULT_OPTIONS, ..._options.palletize };
	}
	// load the product's palette if none provided
	if (!options.palletize.palette || options.palletize.palette.length === 0) {
		options.palletize.palette = product.palette?.colors ?? product.palette;
	}
	// test for missing size and grab default
	if (!options.size) options.size = DRAW_DEFAULT_OPTIONS.size;
	if (!options.background) options.background = DRAW_DEFAULT_OPTIONS.background;
	return options;
};

module.exports = palletize;
