const ut = require('../../radar/utils');
const unGZip = require('./unGZip');

function xhrHurricaneFile(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('load', function () {
        cb(this.response);
    })
    xhr.send();
}

function fetchHurricaneFile(stormNumber, year, basin) {
    var bestTrackURL = `https://ftp.nhc.noaa.gov/atcf/archive/${year}/b${basin}${stormNumber}${year}.dat.gz`;
    console.log(bestTrackURL);
    xhrHurricaneFile(ut.phpProxy + bestTrackURL, function(data) {
        unGZip(data);
    })
}

// bal092021 - hurricane ida
const cycloneNumber = '09';
const cycloneYear = '2021';
const cycloneBasin = 'al';
fetchHurricaneFile(cycloneNumber, cycloneYear, cycloneBasin);