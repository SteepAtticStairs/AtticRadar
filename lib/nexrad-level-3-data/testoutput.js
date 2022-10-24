/* eslint-disable no-console */
const fs = require('fs');
const parser = require('./src');

// get a list of all data files
const files = fs.readdirSync('./data/');

// test each file
console.log('Testing files without errors');
files.forEach((file) => {
	console.log(file);
	try {
		const rawFile = fs.readFileSync(`./data/${file}`);
		const data = parser(rawFile);
		console.log(data);
		// write to disk
		fs.writeFileSync(`./output/${file}.json`, JSON.stringify(data, null, 2));
	} catch (e) {
		console.error(e.stack);
	}
});

// test each file with known errors
console.log('Testing files with errors');
const errors = fs.readdirSync('./data-error/');
errors.forEach((file) => {
	console.log(file);
	try {
		const rawFile = fs.readFileSync(`./data-error/${file}`);
		const data = parser(rawFile);
		console.log(data);
		// write to disk
		fs.writeFileSync(`./output/${file}.json`, JSON.stringify(data, null, 2));
	} catch (e) {
		console.error(e.stack);
	}
});

console.log();
