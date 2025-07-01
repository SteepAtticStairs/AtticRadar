const bzip = require('seek-bzip');
const { RandomAccessFile } = require('./randomaccessfile');
const textHeader = require('./headers/text');
const messageHeader = require('./headers/message');
const { parse: productDescription } = require('./headers/productdescription');
const symbologyHeader = require('./headers/symbology');
const tabularHeader = require('./headers/tabular');
const graphicHeader = require('./headers/graphic');
const radialPackets = require('./headers/radialpackets');
const { products, productAbbreviations } = require('./products');

// parse data provided from string or buffer
const nexradLevel3Data = (file, _options) => {
	const options = combineOptions(_options);

	// convert to random access file
	const raf = new RandomAccessFile(file);

	// result object
	const result = {};

	// get the header
	result.textHeader = textHeader(raf);

	// text header is not accounted for in data description. Note the length here for additional offset calculations
	const textHeaderLength = raf.getPos();

	// test for valid file
	if (!result.textHeader.fileType.startsWith('SDUS')) throw new Error(`Incorrect file type header: ${result.textHeader.fileType}`);
	if (!productAbbreviations.includes(result.textHeader.type)) throw new Error(`Unsupported product type: ${result.textHeader.type}`);

	// message header
	result.messageHeader = messageHeader(raf);
	// get the product
	const product = products[result.messageHeader.code.toString()];

	// test for product type again
	if (!product) throw new Error(`Unsupported product code: ${result.messageHeader.code}`);

	// product description
	result.productDescription = productDescription(raf, product);

	// test for compressed file and decompress
	let decompressed;
	if (result.productDescription.compressionMethod > 0) {
		// store position in file
		const rafPos = raf.getPos();
		// get the remainder of the file
		const compressed = raf.read(raf.getLength() - raf.getPos());
		const data = bzip.decode(compressed);
		// combine the header from the original file with the decompressed data
		raf.seek(0);
		decompressed = new RandomAccessFile(Buffer.concat([
			raf.read(rafPos),
			data,
		]));
		decompressed.seek(rafPos);
	} else {
		// pass file through
		decompressed = raf;
	}

	// symbology parsing
	try {
		if (result.productDescription.offsetSymbology !== 0) {
			// jump to symbology, convert halfwords to bytes
			const offsetSymbologyBytes = textHeaderLength + result.productDescription.offsetSymbology * 2;
			// error checking
			if (offsetSymbologyBytes > decompressed.getLength()) throw new Error(`Invalid symbology offset: ${result.productDescription.offsetSymbology}`);
			decompressed.seek(offsetSymbologyBytes);

			// read the symbology header
			result.symbology = symbologyHeader(decompressed);
			// read the radial packet header
			result.radialPackets = radialPackets(decompressed, result.productDescription, result.symbology.numberLayers, options);
		}
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse symbology data');
	}

	// graphic parsing
	try {
		if (result.productDescription.offsetGraphic !== 0) {
		// jump to graphic, convert halfwords to bytes
			const offsetGraphicBytes = textHeaderLength + result.productDescription.offsetGraphic * 2;
			// error checking
			if (offsetGraphicBytes > decompressed.getLength()) throw new Error(`Invalid graphic offset: ${result.productDescription.offsetGraphic}`);
			decompressed.seek(offsetGraphicBytes);

			// read the graphic header
			result.graphic = graphicHeader(decompressed);
		}
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse graphic data');
	}

	// tabular parsing
	try {
		if (result.productDescription.offsetTabular !== 0) {
		// jump to tabular, convert halfwords to bytes
			const offsetTabularBytes = textHeaderLength + result.productDescription.offsetTabular * 2;
			// error checking
			if (offsetTabularBytes > decompressed.getLength()) throw new Error(`Invalid tabular offset: ${result.productDescription.offsetTabular}`);
			decompressed.seek(offsetTabularBytes);

			// read the tabular header
			result.tabular = tabularHeader(decompressed, product);
		}
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse tabular data');
	}

	// get formatted data if it exists
	try {
		const formatted = product?.formatter?.(result);
		if (formatted) result.formatted = formatted;
	} catch (e) {
		options.logger.warn(e.stack);
		options.logger.warn('Unable to parse formatted tabular data');
	}

	return result;
};

// combine options and defaults
const combineOptions = (newOptions) => {
	let logger = newOptions?.logger ?? console;
	if (logger === false) logger = nullLogger;
	return {
		...newOptions, logger,
	};
};

const nullLogger = {
	log: () => {},
	error: () => {},
	warn: () => {},
};

module.exports = nexradLevel3Data;
