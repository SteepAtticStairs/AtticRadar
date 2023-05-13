// https://www.weather.gov/source/nwr/JS/CCL.js
// https://www.weather.gov/source/nwr/CC.txt

const fs = require('fs');

var final = {};
for (var i in CALLSIGN) {
    final[CALLSIGN[i]] = {
        'ST': ST[i],
        'STATE': STATE[i],
        'COUNTY': COUNTY[i],
        'SAME': SAME[i],
        'SITENAME': SITENAME[i],
        'SITELOC': SITELOC[i],
        'SITESTATE': SITESTATE[i],
        'FREQ': FREQ[i],
        'CALLSIGN': CALLSIGN[i],
        'LAT': LAT[i],
        'LON': LON[i],
        'PWR': PWR[i],
        'STATUS': STATUS[i],
        'WFO': WFO[i],
        'REMARKS': REMARKS[i]
    }
}
fs.writeFileSync('nwr_stations.js', `
const nwr_stations = ${JSON.stringify(final)}

module.exports = nwr_stations;`, 'utf-8');