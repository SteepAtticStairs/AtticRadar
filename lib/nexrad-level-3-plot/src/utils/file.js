const fs = require('fs');
// write a canvas to a Png file
const writePngToFile = (fileName, canvas) => new Promise((resolve, reject) => {
	const writeStream = fs.createWriteStream(fileName);
	const options = {};
	// if there is a palette add it to the options
	if (canvas.palette) options.palette = canvas.palette;
	canvas.createPNGStream(options).pipe(writeStream);
	writeStream.on('finish', () => resolve(fileName));
	writeStream.on('error', (e) => reject(e));
});

module.exports = {
	writePngToFile,
};
