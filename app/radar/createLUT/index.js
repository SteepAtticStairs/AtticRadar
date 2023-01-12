const fs = require('fs');

function mc(coords) {
    function mercatorXfromLng(lng) {
        return (180 + lng) / 360;
    }
    function mercatorYfromLat(lat) {
        return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
    }
    return [mercatorXfromLng(coords[0]), mercatorYfromLat(coords[1])];
}

// this formula was provided by ChatGPT. crazy.
function fwdAzimuthProj(az, distance) {
    // convert distance from meters to kilometers
    distance = distance * 1000;

    // Define the starting latitude and longitude
    const lat1 = 0; // 45.0
    const lon1 = 0; // -75.0

    // Convert the azimuth and starting coordinates to radians
    const azRad = az * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);

    // the earth radius in meters
    const earthRadius = 6378137.0;

    // Calculate the destination latitude and longitude in radians
    const lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(distance / earthRadius) + Math.cos(lat1Rad) * Math.sin(distance / earthRadius) * Math.cos(azRad));
    const lon2Rad = lon1Rad + Math.atan2(Math.sin(azRad) * Math.sin(distance / earthRadius) * Math.cos(lat1Rad), Math.cos(distance / earthRadius) - Math.sin(lat1Rad) * Math.sin(lat2Rad));

    // Convert the destination latitude and longitude from radians to degrees
    const lat2 = lat2Rad * (180 / Math.PI);
    const lon2 = lon2Rad * (180 / Math.PI);

    return [lon2, lat2];
}

// https://github.com/TankofVines/node-vincenty
function destVincenty(az, distance) {
    function toRad(degree) { return degree * (Math.PI / 180) }
    function toDeg(radian) { return radian * (180 / Math.PI) }

    // convert azimuth to bearing
    var brng = az;
    // convert distance from meters to kilometers
    var dist = distance * 1000;
    var lat1 = 0;
    var lon1 = 0;

    /*
    * Define Earth's ellipsoidal constants (WGS-84 ellipsoid)
    */
    // length of semi-major axis of the ellipsoid (radius at equator) - meters
    var a = 6378137;
    // flattening of the ellipsoid
    var f = 1 / 298.257223563; // (a − b) / a
    // length of semi-minor axis of the ellipsoid (radius at the poles) - meters
    var b = 6356752.3142; // (1 − ƒ) * a

    var s = dist;
    var alpha1 = toRad(brng);
    var sinAlpha1 = Math.sin(alpha1);
    var cosAlpha1 = Math.cos(alpha1);

    var tanU1 = (1 - f) * Math.tan(toRad(lat1));
    var cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
    var sigma1 = Math.atan2(tanU1, cosAlpha1);
    var sinAlpha = cosU1 * sinAlpha1;
    var cosSqAlpha = 1 - sinAlpha * sinAlpha;
    var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

    var sigma = s / (b * A), sigmaP = 2 * Math.PI;
    while (Math.abs(sigma - sigmaP) > 1e-12) {
        var cos2SigmaM = Math.cos(2 * sigma1 + sigma);
        var sinSigma = Math.sin(sigma);
        var cosSigma = Math.cos(sigma);
        var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
            B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;
    }

    var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    var lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
        (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
    var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
    var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    var L = lambda - (1 - C) * f * sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    var lon2 = (toRad(lon1) + L + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180...+180

    var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing, if required

    //var result = { lat: toDeg(lat2), lon: toDeg(lon2), finalBearing: toDeg(revAz) };
    var result = [toDeg(lon2), toDeg(lat2)];

    return result;
}

var azimuths = [];
var ranges = [];

for (var i = 0; i <= 720 / 2; i += 0.5) { azimuths.push(i) }
for (var i = 0; i <= 1840 / 4; i += 0.25) { ranges.push(i) }

function getAzDistance(i, n) {
    return {
        'azimuth': azimuths[i],
        'distance': ranges[n]
    }
}

console.log('Building JSON...');
var finalObj = {};
for (var i in azimuths) {
    if (finalObj[azimuths[i]] == undefined) { finalObj[azimuths[i]] = {} }
    for (var n in ranges) {
        var azDist = getAzDistance(i, n);
        var coords = destVincenty(azDist.azimuth, azDist.distance);

        if (finalObj[azimuths[i]][ranges[n]] == undefined) { finalObj[azimuths[i]][ranges[n]] = coords }
    }
}
//console.log(finalObj[7.5][20.25][1] == destVincenty(7.5, 20)[1]);

console.log('Writing to file...');
const stringified = `const radarLUT = ${JSON.stringify(finalObj)}

module.exports = radarLUT`;
fs.writeFileSync('radarLUT.js', stringified, 'utf8');