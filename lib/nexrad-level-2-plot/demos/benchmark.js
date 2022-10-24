/* eslint-disable no-await-in-loop */
const { Level2Radar } = require('nexrad-level-2-data');
// eslint-disable-next-line import/no-extraneous-dependencies
const glob = require('glob');
const fs = require('fs');

const { plot, writePngToFile } = require('../src');

// list files
const files = glob.sync('./data/KLOT/KLOT20210812_171451_V*');	// ref palette tuning

// const store each file's data
const chunks = [];

// parse each file
files.forEach((file) => {
	const fileBuffer = fs.readFileSync(file);
	chunks.push(new Level2Radar(fileBuffer));
});

// combine data
const radarData = Level2Radar.combineData(chunks);

const size = 1800;
const iterations = 5;

// plot for each elevation and size
(async () => {
	const start = new Date();
	for (let i = 0; i < iterations; i += 1) {
		const plots = plot(radarData, ['REF', 'VEL'], {
			size,
			palettize: true,
			cropTo: size / 2,
			alpha: false,
			imageSmoothingEnabled: false,
			antialias: 'none',
		});

		// write files to disk
		const writePromises = [];
		plots.forEach((p) => {
			const { elevation } = p;
			writePromises.push(writePngToFile(`./output/REF-${elevation}-${size}.png`, p.REF));
			writePromises.push(writePngToFile(`./output/VEL-${elevation}-${size}.png`, p.VEL));
		});
		await Promise.allSettled(writePromises);

		const end = new Date();
		console.log(`Iteration: ${i + 1}/${iterations} Average time: ${(end - start) / 1000 / (i + 1)} s`);
	}
})();
