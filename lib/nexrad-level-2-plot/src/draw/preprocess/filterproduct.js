// accomplish some pre-processing in one loop

// filter data for a specific product
// add the necessary azimuth data

const filterProduct = (data, product) => data.map((header) => {
	// get correct data
	let thisRadial = header[product];

	// special case for non-hi-res data
	// re-formats data to expected format
	if (!thisRadial.moment_data && thisRadial) {
		thisRadial = {
			...header,
			moment_data: header[product],
		};

		if (product === 'refelect') {
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

module.exports = filterProduct;
