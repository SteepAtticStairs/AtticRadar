// i,j coordinate functions

// i,j to azimuth/nmi

// default is 4096 i/j units * 0.125 km, converted to nautical miles = 1km = 0.539957nmi
const ijToAzDeg = (i, j, rawScale = 8, conversion = 0.539957) => {
	// calculate nautical miles
	const nm = (Math.sqrt(i ** 2 + j ** 2) / rawScale) * conversion;
	let deg = 0;
	// short circuit potential divide by zero
	if (i === 0) {
		// calculate degrees, then rotate due to north = up = 0 deg convention
		deg = (Math.atan(-j / i) * 180) / Math.PI + 90;
		// coerce to 0<=deg<360
		if (deg < 0) deg += 180;
	}
	return {
		deg,
		nm,
	};
};

module.exports = {
	ijToAzDeg,
};
