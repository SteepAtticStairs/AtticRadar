const CheapRuler = require('cheap-ruler');

module.exports = function (self) {
    self.addEventListener('message', function(ev) {
        function mc(coords) {
            function mercatorXfromLng(lng) {
                return (180 + lng) / 360;
            }
            function mercatorYfromLat(lat) {
                return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
            }
            return [mercatorXfromLng(coords[0]), mercatorYfromLat(coords[1])];
        }

        var points = ev.data[0];
        var lngLat = ev.data[1];
        // [-75.0, 45.0] // lng, lat
        var ruler = new CheapRuler(lngLat.lat, 'kilometers');

        for (var i = 0; i < points.length; i += 2) {
            var az = points[i];
            var distance = points[i + 1];
            var calc = mc(ruler.destination([lngLat.lng, lngLat.lat], distance, az));
            points[i] = calc[0];
            points[i + 1] = calc[1];
        }

        self.postMessage(points);
    })
}