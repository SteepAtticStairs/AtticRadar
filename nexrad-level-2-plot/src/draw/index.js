const canvasObj = require('canvas');

const { createCanvas } = canvasObj;

const Palette = require('./palettes');
const palettizeImage = require('./palettize');

// data pre-processing
const filterProduct = require('./preprocess/filterproduct');
const downSample = require('./preprocess/downsample');
const indexProduct = require('./preprocess/indexproduct');
const rrle = require('./preprocess/rrle');

const drawRadarShape = require('../../../app/radar/draw/drawToMap');

// names of data structures keyed to product name
const dataNames = {
	REF: 'reflect',
	VEL: 'velocity',
	'SW ': 'spectrum',	// intentional space to fill 3-character requirement
	ZDR: 'zdr',
	PHI: 'phi',
	RHO: 'rho',
};

// names of data retrieval routines keyed to product name
const dataFunctions = {
	REF: 'getHighresReflectivity',
	VEL: 'getHighresVelocity',
	RHO: 'getHighresCorrelationCoefficient',
	PHI: 'getHighresDiffPhase',
	ZDR: 'getHighresDiffReflectivity',
	'SW ': 'getHighresSpectrum',
};

// generate all palettes
/* eslint-disable global-require */
const palettes = {
	REF: new Palette(require('./palettes/ref')),
	VEL: new Palette(require('./palettes/vel')),
};
/* eslint-enable global-require */

const preferredWaveformUsage = {
	1: ['REF', 'SW ', 'ZDR', 'PHI', 'RHO'],
	2: ['VEL'],
	3: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
	4: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
	5: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
};

// default options
const DEFAULT_OPTIONS = {
	// must be a square image
	size: 3600,
	cropTo: 3600,
	background: 'black',
	lineWidth: 2,
	usePreferredWaveforms: false,
	alpha: true,
	imageSmoothingEnabled: true,
	antialias: 'default',
	dpi: 96,
};

function setDPI(canvas, dpi) {
    // Set up CSS size.
    canvas.style.width = canvas.style.width || canvas.width + 'px';
    canvas.style.height = canvas.style.height || canvas.height + 'px';

    // Resize canvas and scale future draws.
    var scaleFactor = dpi / 96;
    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
}

const draw = (data, _options) => {
	// combine options with defaults
	const options = {
		...DEFAULT_OPTIONS,
		..._options,
	};

	// check preferred waveforms
	const elevationInfo = data?.vcp?.record?.elevations?.[options?.elevation];
	// elevation info is not available in chunks mode, so preferred waveforms cannot be processed
	if (elevationInfo) {
		const preferredProducts = preferredWaveformUsage[elevationInfo.waveform_type];
		if (options.usePreferredWaveforms && !preferredProducts.includes(options.product)) return false;
	}

	// calculate scale
	if (options.size > DEFAULT_OPTIONS.size) throw new Error(`Upsampling is not supported. Provide a size <= ${DEFAULT_OPTIONS.size}`);
	if (options.size < 1) throw new Error('Provide options.size > 0');
	const scale = DEFAULT_OPTIONS.size / options.size;

	// wsr88d uses a gate size of 0.25km, tdwr uses a gate size of 0.15km, although it is reported as 0.3km for processing reasons
	// this calculation scales the plot accordingly to the nominal 0.25km so all generated plots are at the same scale
	const rawGateSize = data?.data?.[options.elevation]?.[0]?.record?.reflect?.gate_size ?? 0.25;
	const realGateSize = rawGateSize !== 0.3 ? rawGateSize : rawGateSize / 2;
	var gateSizeScaling = 0.25 / realGateSize;

	// calculate crop, adjust if necessary
	const cropTo = Math.min(options.size, options.cropTo);
	if (options.cropTo < 1) throw new Error('Provide options.cropTo > 0');

	// create the canvas and context
	const canvas = document.getElementById('theCanvas');
	const ctx = canvas.getContext('2d', { alpha: options.alpha });
	ctx.canvas.width = cropTo;
	ctx.canvas.height = cropTo;
	ctx.antialias = options.antialias;
	ctx.imageSmoothingEnabled = options.imageSmoothingEnabled;

	setDPI(canvas, options.dpi);

	// fill background with black
	ctx.fillStyle = options.background;
	ctx.fillRect(0, 0, cropTo, cropTo);

	// canvas settings
	ctx.imageSmoothingEnabled = true;
	ctx.lineWidth = options.lineWidth / gateSizeScaling;
	ctx.translate(cropTo / 2, cropTo / 2);
	ctx.rotate(-Math.PI / 2);

	// get the palette
	const palette = palettes[options.product];
	// test for valid palette
	//if (!palette) throw new Error(`No product found for product type: ${options.product}`);

	// set the elevation
	data.setElevation(options.elevation);
	// get the header data
	const headers = data.getHeader();

	// calculate resolution in radians, default to 1°
	let resolution = Math.PI / 180;
	if (data?.vcp?.record?.elevations?.[options.elevation]?.super_res_control?.super_res?.halfDegreeAzimuth) resolution /= 2;
	// calculate half resolution step for additional calculations below
	const halfResolution = resolution / 2;

	// match product name to data
	const dataName = dataNames[options.product];
	const dataFunction = dataFunctions[options.product];

	// check for valid product
	if (dataName === undefined) throw new Error(`No data object name found for product: ${options.product}`);
	if (dataFunction === undefined) throw new Error(`No data function found for product: ${options.product}`);

	// check for data for this product
	if (headers[0][dataName] === undefined) return false;

	// pre-processing
	const filteredProduct = filterProduct(headers, dataName);
	const downSampledProduct = downSample(filteredProduct, scale, resolution, options, palette);
	//const indexedProduct = indexProduct(downSampledProduct, palette);
	// indexedProduct is the original, but it modifies the gate values
	const rrlEncoded = rrle(filteredProduct, resolution, false);

	var featuresArr = [];
	function pushPoint(lng1, lat1, lng2, lat2, lng3, lat3, lng4, lat4, value) {
		featuresArr.push({
			"type": "Feature",
			"geometry": { "type": "Polygon",
				"coordinates": [
					[
						[lng1, lat1],
						[lng2, lat2],
						[lng3, lat3],
						[lng4, lat4]
					]
				]
			},
			"properties": {
				"value": value,
			}
		},);
	}

	var valArr = [];
	var arr = [];
	var json = {
		'radials': [],
		'values': [],
		'azimuths': [],
		'version': [],
	};
	// loop through data
	if (data.header.version == "01" || data.header.version == "E2") {
		gateSizeScaling = rrlEncoded[0].gate_size * 0.25;
	}
	var adder;
	if (options.product == "REF") {
		adder = 30;
	} else if (options.product == "VEL") {
		adder = 30;
	} else if (options.product == "RHO") {
		adder = 0;
	} else if (options.product == "PHI") {
		adder = 0;
	} else if (options.product == "ZDR") {
		adder = 10;
	} else if (options.product == "SW ") {
		adder = 0;
	}
	var c = [];
	rrlEncoded.forEach((radial) => {
		arr = [];
		valArr = [];
		json.azimuths.push(radial.azimuth)
		// calculate plotting parameters

		var deadZone;
		if (data.header.version == "01" || data.header.version == "E2") {
			deadZone = radial.first_gate / radial.gate_size / scale * gateSizeScaling;
		} else {
			deadZone = radial.first_gate / radial.gate_size / scale;
		}

		// 10% is added to the arc to ensure that each arc bleeds into the next just slightly to avoid radial empty spaces at further distances
		const startAngle = radial.azimuth * (Math.PI / 180) - halfResolution * 1.1;
		const endAngle = radial.azimuth * (Math.PI / 180) + halfResolution * 1.1;
		// plot each bin
		radial.moment_data.forEach((bin, idx) => {
			if (bin === null)  return;

			//ctx.beginPath();
			// different methods for rrle encoded or not
			if (bin.count) {
				// rrle encoded
				//ctx.strokeStyle = palette.lookupRgba[bin.value];
				//ctx.arc(0, 0, (idx + deadZone) * gateSizeScaling, startAngle, endAngle + resolution * (bin.count - 1));
				arr.push((idx + deadZone) * gateSizeScaling)
				valArr.push(bin.value + adder)
				//c.push(bin.value + adder)
			} else {
				// plain data
				//ctx.strokeStyle = palette.lookupRgba[bin];
				//ctx.arc(0, 0, (idx + deadZone) * gateSizeScaling, startAngle, endAngle);
				arr.push((idx + deadZone) * gateSizeScaling)
				valArr.push(bin + adder)
				//c.push(bin + adder)
			}
			//ctx.stroke();
		});
		json.radials.push(arr)
		json.values.push(valArr)
	});
	//console.log(Math.min(...[...new Set(c)]), Math.max(...[...new Set(c)]))
	//console.log(valueArr)
	//console.log(featuresArr)
	//var geojsonParentTemplate = {
	//	"type": "FeatureCollection",
	//	"features": featuresArr
	//}
	json.version.push(data.header.version);
	var blob = new Blob([JSON.stringify(json)], {type: "text/plain"});
    var url = window.URL.createObjectURL(blob);
	/*const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = 'sus.geojson';
    document.body.appendChild(a);
    //a.click();*/

	//testHello('yeet')
	var shtation = document.getElementById('fileStation').innerHTML;
    $.getJSON('/resources/radarStations.json', function(data) {
		var statLat;
		var statLng;
		if (data.hasOwnProperty(shtation)) {
			statLat = data[shtation][1];
			statLng = data[shtation][2];
		} else {
			var fileNameStation = $('#dataDiv').data('fileName').slice(0, 4);
			statLat = data[fileNameStation][1];
			statLng = data[fileNameStation][2];
		}
		drawRadarShape(url, statLat, statLng, options.product, !$('#shouldLowFilter').prop("checked"));
    });

    document.getElementById('spinnerParent').style.display = 'none';

	if (!options.palettize) {
	// return the palette and canvas
		return {
			canvas,
		};
	}

	// palettize image
	const palettized = palettizeImage(ctx, palette);

	// return palettized image
	return {
		canvas: palettized,
		palette: palette.getPalette(),
	};
};

module.exports = {
	draw,
	DEFAULT_OPTIONS,
	canvas: canvasObj,
};
