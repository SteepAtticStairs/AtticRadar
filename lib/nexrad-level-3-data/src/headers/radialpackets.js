// register packet parsers

const { parser } = require('../packets');

const parse = (raf, productDescription, layerCount, options) => {
	const layers = [];
	for (let layerIndex = 0; layerIndex < layerCount; layerIndex += 1) {
		// store starting so skipping the block is possible if layer can't be parsed
		const startPos = raf.getPos();

		// read the header
		const layerDivider = raf.readShort();
		const layerLength = raf.readInt();
		if (layerDivider !== -1) throw new Error(`Invalid layer divider ${layerDivider} in layer ${layerIndex}`);
		if (layerLength + raf.getPos() > raf.getLength()) throw new Error(`Layer size overruns block size for layer ${layerIndex}`);

		try {
			const packets = [];
			while (raf.getPos() < startPos + layerLength) {
				packets.push(parser(raf, productDescription));
			}
			// if there's only one packet return it directly, otherwise return the array
			if (packets.length === 1) {
				layers.push(packets[0]);
			} else {
				layers.push(packets);
			}
		} catch (e) {
			options.logger.warn(e.stack);
			// skip this layer
			raf.seek(startPos + layerLength);
			layers.push(undefined);
		}
	}
	return layers;
};

module.exports = parse;
