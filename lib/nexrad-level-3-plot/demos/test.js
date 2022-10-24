/* eslint-disable no-console */
const fs = require('fs');
const { plotAndData, writePngToFile } = require('../src');

// read file

// 56 N0S Storm relative velocity
// const fileName = LOT_N0S_2021_01_31_11_06_30';

// 78 One-hour precipitation
// const fileName = 'LOT_N1P_2021_01_31_11_06_30';

// 80 NTP Storm total accumulation
// const fileName = LOT_NTP_2021_01_31_11_06_30';

// 165 N0H Hydrometeor classification
// const fileName = 'LOT_N0H_2021_01_31_11_06_30';

// 177 HHC Hybrid Hydrometeor classification
const fileName = 'LOT_HHC_2021_01_31_11_06_30';

// pass to plotting engine as a string or buffer
const file = fs.readFileSync(`./data/${fileName}`);
const level3Plot = plotAndData(file, { palletize: { generate: 2 }, background: 'black' });

//console.log(level3Plot);
(async () => {
	await writePngToFile(`./output/${fileName}.png`, level3Plot.image);
	await writePngToFile(`./output/${fileName}-pal.png`, level3Plot.palletized);
})();
