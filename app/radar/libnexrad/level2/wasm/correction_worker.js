const CheapRuler = require('cheap-ruler');

module.exports = function (self) {
    self.addEventListener('message', function (ev) {
        function _correct_x_y(x, y, lngLat) {
            function radians(deg) {
                return (3.141592654 / 180.) * deg;
            }
            function calculateAzimuth(lngLat1, x, y) {
                // Convert x and y to latitude and longitude
                var lon = (x * 360.0) - 180.0;
                var lat = (2.0 * Math.atan(Math.exp((180.0 - y * 360.0) * Math.PI / 180.0)) - Math.PI / 2.0) * 180.0 / Math.PI;

                // Convert latitude and longitude to radians
                var lat1Rad = radians(lngLat1.lat);
                var lon1Rad = radians(lngLat1.lng);
                var lat2Rad = radians(lat);
                var lon2Rad = radians(lon);

                // Calculate the azimuth (bearing)
                var dLon = lon2Rad - lon1Rad;
                var yRad = Math.sin(dLon) * Math.cos(lat2Rad);
                var xRad = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
                var azimuthRad = Math.atan2(yRad, xRad);

                // Convert azimuth from radians to degrees
                var azimuthDegrees = (azimuthRad * 180.0 / Math.PI + 360.0) % 360.0;

                return azimuthDegrees;
            }

            function haversineDistance(lngLat1, x, y) {
                // Convert x and y to latitude and longitude
                var lon = (x * 360.0) - 180.0;
                var lat = (2.0 * Math.atan(Math.exp((180.0 - y * 360.0) * Math.PI / 180.0)) - Math.PI / 2.0) * 180.0 / Math.PI;

                // Radius of the Earth in meters
                var earthRadius = 6371000.0;

                // Convert latitude and longitude to radians
                var lat1Rad = radians(lngLat1.lat);
                var lon1Rad = radians(lngLat1.lng);
                var lat2Rad = radians(lat);
                var lon2Rad = radians(lon);

                // Haversine formula
                var dLat = lat2Rad - lat1Rad;
                var dLon = lon2Rad - lon1Rad;
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var distance = earthRadius * c;

                return distance;
            }

            function mc(coords) {
                function mercatorXfromLng(lng) {
                    return (180 + lng) / 360;
                }
                function mercatorYfromLat(lat) {
                    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
                }
                return [mercatorXfromLng(coords[0]), mercatorYfromLat(coords[1])];
            }

            var ruler = new CheapRuler(lngLat.lat, 'kilometers');

            const azimuth = calculateAzimuth(lngLat, x, y);
            const range = haversineDistance(lngLat, x, y) / 1000;
            var calc = mc(ruler.destination([lngLat.lng, lngLat.lat], range, azimuth));

            return [calc[0], calc[1]];
        }

        var points = ev.data[0];
        var location = ev.data[1];
        const lngLat = {lat: location[0], lng: location[1]};

        for (var i = 0; i < points.length; i += 2) {
            var az = points[i + 1];
            var distance = points[i];
            var calc = _correct_x_y(distance, az, lngLat);
            points[i] = calc[0];
            points[i + 1] = calc[1];
        }

        self.postMessage(points);
    })
}