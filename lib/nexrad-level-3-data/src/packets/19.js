const code = 25;
const description = 'Special Graphic Symbol Packet';

// uses the same parser as 23 (0x17)
const { parser } = require('./17');

module.exports = {
	code,
	description,
	parser,
};
