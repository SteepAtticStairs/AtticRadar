/* eslint-disable no-console */
const fs = require('fs');
const { plotAndData, writePngToFile } = require('../src');

// sizes to produce
const sizes = [100, 400, 900, 1350, 1800];

// get a list of all data files
const files = fs.readdirSync('./data/');

// plot each file
(async () => {
	await Promise.allSettled(files.map(async (file) => {
		console.log(file);
		try {
			const rawFile = fs.readFileSync(`./data/${file}`);
			// plot for each size
			return sizes.map(async (size) => {
				console.log(`${file} ${size}`);
				try {
					const level3Plot = plotAndData(rawFile, { size, palletize: { generate: 2 } });
					console.log(level3Plot);
					// test for returned image
					if (!level3Plot) return false;

					// write to disk
					const writeResult = [];
					if (level3Plot.image) writeResult.push(await writePngToFile(`./output/${file}-${size}.png`, level3Plot.image));
					if (level3Plot.palletized) writeResult.push(await writePngToFile(`./output/${file}-${size}-pal.png`, level3Plot.palletized));
					return writeResult;
				} catch (e) {
					console.error(e.message);
					return false;
				}
			});
		} catch (e) {
			console.error(e.message);
			return false;
		}
	}).flat());
})();
