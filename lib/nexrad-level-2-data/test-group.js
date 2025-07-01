/* eslint-disable no-console */
const fs = require('fs/promises');
const glob = require('glob');
const { Level2Radar } = require('./src/index');

// const fileToLoad = './data/non-hi-res/KLOT19950413_132143.gz'; // The radar archive file to load
const filesToLoad = './data/consolemessage/*'; // The radar archive file to load
// const fileToLoadCompressed = './data/KLOT20200715_230602_V06'; // The radar archive file to load
// const fileToLoadError = './data/messagesizeerror';
const files = glob.sync(filesToLoad);

(async () => {
	files.forEach(async (file) => {
		// load file into buffer
		const data = await fs.readFile(file);
		console.time('load-uncompressed');

		const radar = new Level2Radar(data);
		console.timeEnd('load-uncompressed');
		const reflectivity = radar.getHighresReflectivity();
		console.log(reflectivity);
		radar.getHeader();
	});
})();
