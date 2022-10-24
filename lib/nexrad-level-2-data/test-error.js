/* eslint-disable no-console */
const fs = require('fs');
const { Level2Radar } = require('./src/index');

// these files should contain the same error
const fileToLoadError = './data/messagesizeerror';
// const fileToLoadError = 'data/KLOT20210625_075708_V06';

(async () => {
	// load file
	const dataError = await new Promise((resolve) => {
		fs.readFile(fileToLoadError, (err, fileData) => {
			resolve(fileData);
		});
	});
	const radarError = new Level2Radar(dataError);
	console.log(radarError);

	// error is in elevation 10
	radarError.setElevation(10);
	const reflectivityCompressed = radarError.getHighresReflectivity();
	console.log(reflectivityCompressed);
})();
