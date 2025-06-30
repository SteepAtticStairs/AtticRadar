const CheapRuler = require('cheap-ruler');
const dest_vincenty = require('./dest_vincenty');

module.exports = function (self) {
    self.addEventListener('message', function (ev) {
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

        for (var i = 0; i < points.length; i += 2) {
            var az = points[i];
            var distance = points[i + 1];
            var calc;
            // for TDWRs, the distances start right at the radar station, which is 0.
            // vincenty's formula can't handle these cases very well but cheap ruler can.
            // the only time cheap ruler is used is the TDWR gates right next to the radar tower,
            // eveything else is vincenty. WSR-88Ds don't have this problem so they only use vincenty.
            if (distance == 0) {
                console.warn('Gate distance is 0');
                var ruler = new CheapRuler(lngLat.lat, 'kilometers');
                calc = mc(ruler.destination([lngLat.lng, lngLat.lat], distance, az));
            } else {
                calc = mc(dest_vincenty({lng: lngLat.lng, lat: lngLat.lat}, distance * 1000, az));
            }
            points[i] = calc[0];
            points[i + 1] = calc[1];
        }

        self.postMessage(points);
    })
}