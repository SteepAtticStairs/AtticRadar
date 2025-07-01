const { draw, canvas } = require('./draw');
const { keys } = require('./draw/palettes/hexlookup');
const { writePngToFile } = require('./utils/file');
/**
 * Plot level 2 data
 * @param {Level2Data} data output from the nexrad-level-2-data library
 * @param {(string|string[])} _products Options are REF, VEL, SW , ZDR, PHI and RHO
 * @param {object} options Plotting options
 * @param {number} [options.size=3600] 1 to 3600. Size of the x and y axis in pixels. The image must be square so only a single integer is needed.
 * @param {number} [options.cropTo=3600] 1 to 3600. After scaling and downsampling as described above crop the resulting plot to the size specified. Internally, the image is actually drawn at the cropped size to save on processing time.
 * @param {string} [options.background=#000000] Background color of the image. This can be transparent by using #RGBA notation.
 * @param {number} [options.lineWidth=2] The raster image is created by drawing several arcs at the locations and colors specified in the data file. When scaling down you may get a better looking image by adjusting this value to something large than the default.
 * @param {(boolean|object)} [options.palettize] After drawing the image convert the image from RGBA to a palettized image. When true the same palette as the product is used.
 * @param {(undefined|number|number[])} [options.elevations=undefined] List of elevations to plot.
 * @param {boolean} [options.usePreferredWaveforms = true] Limit the plotted data to the preferred use of waveforms 1 and 2.
 * @param {boolean} [options.alpha = true] Draw on a 32-bit canvas. Passed directly to getContext('2d', {alpha}).
 * @param {boolean} [options.imageSmoothingEnabled = true] Control image smoothing. Passed directly to ctx.imageSmoothingEnabled.
 * @param {string} [options.antialias = 'default'] Control antialias. Passed directly to ctx.antialias (part of node-canvas)
 * @returns Canvas
 */
const plot = (data, _products, options) => {
	// store result
	const result = [];

	let products;
	// make product list into an array
	if (_products && Array.isArray(_products)) {
		products = _products;
	} else if (typeof _products === 'string') {
		products = [_products];
	} else {
		// default to all products
		products = ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'];
	}

	// get the available elevations
	const availableElevations = data.listElevations();
	if (availableElevations.length === 0) throw new Error('No elevations availabe');

	// handle options.elevations defaults
	let elevations = options?.elevations;
	if (!elevations) elevations = availableElevations;
	if (typeof elevations === 'number') elevations = [elevations];

	elevations.forEach((elevation) => {
		const elevationResult = { elevation };
		products.forEach((product) => {
			// parse and store result
			elevationResult[product] = draw(data, {
				...options,
				elevation,
				product,
			});
		});
		result.push(elevationResult);
	});

	return result;
};

module.exports = {
	plot,
	writePngToFile,
	canvas,
};
