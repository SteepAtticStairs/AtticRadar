const fs = require('fs');
const path = require('path');

require('./30')
require('./56')
require('./58')
require('./59')
require('./61')
require('./62')
require('./78')
require('./80')
require('./94')
require('./99')
require('./134')
require('./141')
require('./153')
require('./154')
require('./159')
require('./161')
require('./165')
require('./170')
require('./172')
require('./177')
require('./180')
require('./182')
require('./186')

// load all products in folder automatically
const folders = fs.readdirSync(__dirname).filter((folder) => folder !== 'index.js');
// eslint-disable-next-line import/no-dynamic-require, global-require
const productsRaw = folders.map((folder) => require('./' + folder));

// make up a list of products by integer type
const products = {};
productsRaw.forEach((product) => {
	if (products[product.code]) { throw new Error(`Duplicate product code ${product.code}`); }
	products[product.code] = product;
});

// list of available product code abbreviations for type-checking
const productAbbreviations = productsRaw.map((product) => product.abbreviation).flat();

module.exports = {
	products,
	productAbbreviations,
};
