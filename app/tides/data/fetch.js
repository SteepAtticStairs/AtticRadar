const fs = require('fs');
const { execSync } = require('child_process');
const all_stations = require('./all_stations');

// const url = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/1611401.json';
// const curl_output = JSON.parse(execSync(`curl ${url}`).toString());
// console.log(curl_output);

const total = all_stations.stations.length;

for (var i = 0; i < total - 1; i++) {
    delete all_stations.stations[i].tidepredoffsets;
    const id = all_stations.stations[i].id;

    const url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${id}.json`;
    // wget -q --output-document -
    // curl -s
    const curl_output = JSON.parse(execSync(`wget -q --output-document - ${url}`).toString());
    all_stations.stations[i].alt_name = curl_output.stations[0].name;

    fs.writeFileSync(`individual/${id}.js`, 
`const ${id} = ${JSON.stringify(curl_output)}

module.exports = ${id};`, 'utf-8');

    console.log(`Processed ${(((i + 1) / total) * 100).toFixed(2)}%`);
}

fs.writeFileSync('all_stations.js', 
`const all_stations = ${JSON.stringify(all_stations)}

module.exports = all_stations;`, 'utf-8');