const { createCanvas } = require('canvas');
const { keys } = require('../../../nexrad-level-2-plot/src/draw/palettes/hexlookup');
const Palette = require('./palette');
const plotData = require('../../../app/draw/drawToMap');

const DEFAULT_OPTIONS = {
	// must be a square image
	size: 1800,
	background: 'black',
	lineWidth: 2,
};

const scaleArray = (fromRange, toRange) => {
	const d = (toRange[1] - toRange[0]) / (fromRange[1] - fromRange[0]);
  	return from =>  (from - fromRange[0]) * d + toRange[0];
};

const draw = (data, product, _options) => {
	// combine options with defaults
	const options = {
		...DEFAULT_OPTIONS,
		..._options,
	};

	// calculate scale
	if (options.size > DEFAULT_OPTIONS.size) throw new Error(`Upsampling is not supported. Provide a size <= ${DEFAULT_OPTIONS.size}`);
	if (options.size < 1) throw new Error('Provide a size > 0');
	const scale = DEFAULT_OPTIONS.size / options.size;

	var c = [];
	var json = {
		'radials': [],
		'values': [],
		'azimuths': [],
		'version': [],
	};
	var adder = 0;
	var divider = 1;
	if (product[0] == "N0U" || product[0] == "N0G") {
		adder = 65;
	}
	// generate a palette
	//const palette = Palette.generate(product.palette);
	// calculate scaling paramater with respect to pallet's designed criteria
	//const paletteScale = (data?.productDescription?.plot?.maxDataValue ?? 255) / (product.palette.baseScale ?? data?.productDescription?.plot?.maxDataValue ?? 1);
	// use the raw values to avoid scaling and un-scaling
	var radialLoop = data.radialPackets[0].radials;
	if (product[0] == "N0C" || product[0] == "N0X") {
		radialLoop = data.radialPackets[0].radialsRaw;
	}
	radialLoop.forEach((radial) => {
		arr = [];
		valArr = [];
		const startAngle = radial.startAngle * (Math.PI / 180);
		const endAngle = startAngle + radial.angleDelta * (Math.PI / 180);
		json.azimuths.push(radial.startAngle)
		// track max value for downsampling
		let maxDownsample = 0;
		let lastRemainder = 0;
		// for each bin
		radial.bins.forEach((bin, idx) => {
			// skip null values
			if (bin === null) return;
			// see if there's a sample to plot
			if (!bin) return;
			//ctx.beginPath();
			//ctx.strokeStyle = palette[Math.round(thisSample * paletteScale)];
			//ctx.arc(0, 0, (idx + data.radialPackets[0].firstBin) / scale, startAngle, endAngle);

			arr.push(idx + data.radialPackets[0].firstBin)
			valArr.push((bin + adder) / divider)
			c.push((bin + adder) / divider)

			//ctx.stroke();
		});
		json.radials.push(arr)
		json.values.push(valArr)
	});

	// if the first azimuth isn't zero (e.g. azimuths going 0-360) then we need to do some re-arrangement
	if (json.azimuths[0] != 0) {
		// store the value of first azimuth (in this case it will be the offset)
		var startAzimuth = json.azimuths[0];
		for (val in json.azimuths) {
			// add the starting value to each azimuth value, allowing for correct rotation
			json.azimuths[val] = json.azimuths[val] + startAzimuth
		}
	}
	// sort each azimuth value from lowest to highest
	json.azimuths.sort(function(a, b){return a - b});

	if (product[0] == "DVL") {
		var arrMin = Math.min(...[...new Set(c)]);
		var arrMax = Math.max(...[...new Set(c)]);
		for (value in json.values) {
			json.values[value] = json.values[value].map(scaleArray([arrMin, arrMax], [0.1, 75]))
		}
	}

	console.log(Math.min(...[...new Set(c)]), Math.max(...[...new Set(c)]))
	//console.log([...new Set(c)])
	json.version = 'l3';
	if (product[0] == "NXQ" || product[0] == "N0S") {
		json.version = product[0];
	}
	console.log(json)
	var blob = new Blob([JSON.stringify(json)], {type: "text/plain"});
    var url = window.URL.createObjectURL(blob);
	document.getElementById('level3json').innerHTML = url;
	/*const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = 'level3.json';
    document.body.appendChild(a);
    a.click();*/

	var currentStation = 'K' + data.textHeader.id3;
	if (document.getElementById('fileStation').innerHTML != currentStation) {
		document.getElementById('fileStation').innerHTML = currentStation;
	}
	$.getJSON('../resources/radarStations.json', function(data) {
		var statLat = data[currentStation][1];
		var statLng = data[currentStation][2];
		// ../../../data/json/KLWX20220623_014344_V06.json
		// product.abbreviation
		plotData.drawRadarShape(url, statLat, statLng, product, !$('#shouldLowFilter').prop("checked"));

		//new mapboxgl.Marker()
		//    .setLngLat([stationLng, stationLat])
		//    .addTo(map);
	});

	//return canvas;
};

module.exports = {
	draw,
	DEFAULT_OPTIONS,
};
