const drawRadarShape = require('../draw/drawToMap');

const scaleArray = (fromRange, toRange) => {
	const d = (toRange[1] - toRange[0]) / (fromRange[1] - fromRange[0]);
  	return from =>  (from - fromRange[0]) * d + toRange[0];
};

function draw(data) {
    var product = data.productDescription.abbreviation;
    if (Array.isArray(product)) {
        product = product[0];
    }
    var c = [];
	var json = {
		'radials': [],
		'values': [],
		'rawValues': [],
		'azimuths': [],
		'version': [],
	};
	var adder = 0;
	var divider = 1;
	if (product == "N0U" || product == "N0G" || product == "TVX") {
		adder = 0;
	} else if (product == "N0B" || product == "NXQ" || product == "TZX" || product == "TZL") {
		adder = 0;
	}
	// generate a palette
	//const palette = Palette.generate(product.palette);
	// calculate scaling paramater with respect to pallet's designed criteria
	//const paletteScale = (data?.productDescription?.plot?.maxDataValue ?? 255) / (product.palette.baseScale ?? data?.productDescription?.plot?.maxDataValue ?? 1);
	// use the raw values to avoid scaling and un-scaling
	var radialLoop = data.radialPackets[0].radials;

	var c = [];
	radialLoop.forEach((radial) => {
		arr = [];
		valArr = [];
		rawValArr = [];
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

			var correctedValue = bin;
			if (product == 'N0S') {
                // storm relative velocity tweaks
				var stormRelativeVelocityArr = [-50, -36, -26, -20, -10, -1, 0, 10, 20, 26, 36, 50, 64, 999];
				correctedValue = stormRelativeVelocityArr[bin - 2];
			} else {
				correctedValue = bin;
			}

			arr.push(idx + data.radialPackets[0].firstBin)
			valArr.push(bin)
			rawValArr.push(correctedValue)
			//c.push(correctedValue);

			//ctx.stroke();
		});
		json.radials.push(arr)
		json.values.push(valArr)
		json.rawValues.push(rawValArr);
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
	//console.log(json)

	//console.log(Math.min(...[...new Set(c)]), Math.max(...[...new Set(c)]))
	//console.log([...new Set(c)])
	json.version = 'l3';
	if (product == "NXQ" || product == "N0S" || product == "DVL" || product == "NSW" || product == "TZX" || product == "TVX" || product == "TZL") {
		json.version = product;
	}
	//console.log(json)
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

	$.getJSON('https://steepatticstairs.github.io/AtticRadar/resources/stationAbbreviations.json', function(abrvData) {
		var currentStation = abrvData[data.textHeader.id3];
		if (document.getElementById('fileStation').innerHTML != currentStation) {
			document.getElementById('fileStation').innerHTML = currentStation;
		}
		$.getJSON('https://steepatticstairs.github.io/AtticRadar/resources/radarStations.json', function(data) {
			var statLat = data[currentStation][1];
			var statLng = data[currentStation][2];
			// ../../../data/json/KLWX20220623_014344_V06.json
			// product.abbreviation
			drawRadarShape(url, statLat, statLng, product, !$('#shouldLowFilter').prop("checked"));

			//new mapboxgl.Marker()
			//    .setLngLat([stationLng, stationLat])
			//    .addTo(map);
		});
	});
}

module.exports = draw