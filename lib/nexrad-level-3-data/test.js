/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const fs = require('fs');
const util = require('util');
const nexradLevel3Data = require('./src');
const parser = require('./src');

// read file

// 56 N0S Storm relative velocity
// const file = fs.readFileSync('./data/LOT_N0S_2021_01_31_11_06_30');

// 58 NTP Storm Tracking Information
// const file = fs.readFileSync('./data/JAX_NST_2021_04_11_19_37_00');
// const file = fs.readFileSync('./data/TBW_NST_2021_04_19_19_02');
// const file = fs.readFileSync('./data/KDGX_NST_2022_01_16_09_31');	// error packet id 0x0019

// 59 NHI Hail Index
// const file = fs.readFileSync('./data/DTW_NHI_2021_04_08_19_47');
// const file = fs.readFileSync('./data/TBW_NHI_2021_04_19_19_02');

// 61 NTV
// const file = fs.readFileSync('./data/sn.0011');
// const file = fs.readFileSync('./data/sn.0012');

// 62 NSS
// const file = fs.readFileSync('./data/TBW_NSS_2021_04_19_19_02');
// const file = fs.readFileSync('./data/KBYX_NSS_2022_01_16_09_31');	// error with block id 4
// const file = fs.readFileSync('./data/KCAE_NSS_2022_01_16_09_31');	// error with block id 5
// const file = fs.readFileSync('./data/KFFC_NSS_2022_01_16_09_31');	// error with block id 7
// const file = fs.readFileSync('./data-error/KLOT_NSS_2022_01_16_09_31');	// error with block id 3
// const file = fs.readFileSync('./data-error/KLTX_NSS_2022_02_15_06_44');	// error with block id 3

// 78 One-hour precipitation
// const file = fs.readFileSync('./data/LOT_N1P_2021_01_31_11_06_30');

// 80 NTP Storm total accumulation
// const file = fs.readFileSync('./data/LOT_NTP_2021_01_31_11_06_30');

// 94 NXQ Digital Base Reflectivy
// const file = fs.readFileSync('./data/SDUS53 KLOT 150709');

// 141 NMD Mesocyclone
// const file = fs.readFileSync('./data/LOT_NMD_2021_06_21_04_22_17');

// 165 N0H Hydrometeor classification
// const file = fs.readFileSync('./data/LOT_N0H_2021_01_31_11_06_30');

// 172 DTA Storm Total Precipitation
// const file = fs.readFileSync('./data/LOT_DTA_2021_02_28_15_05_33');
// const file = fs.readFileSync('./data/LOT_DTA_2021_05_08_03_47_25');	// has error
// const file = fs.readFileSync('./data/LOT_DAA_2021_05_08_03_40_29');	// different radial packet from standard = 1, no radial data

// 177 HHC Hybrid Hydrometeor classification
const file = fs.readFileSync('./data/LOT_HHC_2021_01_31_11_06_30');

// pass to parser as a string or buffer
const level3Data = nexradLevel3Data(file);

// try different loggers
// const level3Data = parser(file, { logger: false });
// const level3Data = parser(file, { logger: customLogger });

// console.log(util.inspect(level3Data, true, 10));
console.log(level3Data);
