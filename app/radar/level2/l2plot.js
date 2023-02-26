const calculateVerticies = require('../draw/calculateVertices');

const filterProduct = (data, product) => data.map((header) => {
	// get correct data
	let thisRadial = header[product];
    console.log(thisRadial)

	// special case for non-hi-res data
	// re-formats data to expected format
	if (!thisRadial.moment_data && thisRadial) {
		thisRadial = {
			...header,
			moment_data: header[product],
		};

		if (product === 'reflect') {
			thisRadial.gate_size = header.surveillance_range_sample_interval;
			thisRadial.gate_count = header.number_of_surveillance_bins;
		} else {
			thisRadial.gate_size = header.doppler_range_sample_interval;
			thisRadial.gate_count = header.number_of_doppler_bins;
		}

		thisRadial.first_gate = 2;
	}

	// skip if this radial isn't found
	if (thisRadial === undefined) return false;
	thisRadial.azimuth = header.azimuth;
	return thisRadial;
	// remove any missing radials
}).filter((d) => d);

const dataNames = ['reflect', 'refelect', 'velocity', 'spectrum', 'zdr', 'phi', 'rho'];
function correctRadarObject(l2rad) {
    for (var elevation in l2rad.data) {
        for (var radial in l2rad.data[elevation]) {
            var curRadial = l2rad.data[elevation][radial].record;
            for (var i in dataNames) {
                var curRadialProduct = curRadial[dataNames[i]];
                if (curRadialProduct != undefined) {
                    if (!curRadialProduct.hasOwnProperty('moment_data')) {
                        var moment_data = curRadialProduct;
                        curRadialProduct = {};
                        curRadialProduct.moment_data = moment_data;
                        if (dataNames[i] === 'reflect') {
                            curRadialProduct.gate_size = curRadial.surveillance_range_sample_interval;
                            curRadialProduct.gate_count = curRadial.number_of_surveillance_bins;
                        } else {
                            curRadialProduct.gate_size = curRadial.doppler_range_sample_interval;
                            curRadialProduct.gate_count = curRadial.number_of_doppler_bins;
                        }
                        curRadialProduct.first_gate = 0;

                        l2rad.data[elevation][radial].record[dataNames[i]] = curRadialProduct;
                    }
                }
            }
        }
    }
    return l2rad;
}

function l2plot(l2rad, product, elevation) {
    l2rad = correctRadarObject(l2rad);
    //l2rad.header.ICAO = 'KMLB';
    window.l2rad = l2rad;
    window.l2radOptions = [product, elevation];

    calculateVerticies(l2rad, 2, {
        'product': product,
        'elevation': elevation
    });
}

module.exports = l2plot;