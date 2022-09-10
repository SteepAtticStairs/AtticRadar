/* eslint-disable no-console */
const fs = require('fs');
const { plotAndData, writePngToFile } = require('../nexrad-level-3-plot/src');

// 177 HHC Hybrid Hydrometeor classification
const fileName = 'LWX_HHC_2022_04_18_15_21_24';

// pass to plotting engine as a string or buffer
const file = fs.readFileSync(`./data/LWX_HHC_2022_04_18_15_21_24`);
const level3Plot = plotAndData(file, {
    size: '500',
    background: '#00000000'
    //background: 'black'
});

// clone AtticRadar repo
// cd level3test
// browserify -t brfs index.js -o bundle.js

//console.log(level3Plot);
//(async () => {
//	await writePngToFile(`${fileName}.png`, level3Plot.image);
//	//await writePngToFile(`${fileName}-pal.png`, level3Plot.palletized);
//})();
