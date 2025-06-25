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

        function dest_vincenty(start, distance, bearing) {
            const a = 6378137.0;
            const f = 1 / 298.257223563;
            const b = a * (1 - f);

            if (distance === 0) {
                return [start.lat, start.lng];
            }

            const to_rad = deg => deg * Math.PI / 180;
            const to_deg = rad => rad * 180 / Math.PI;

            const φ1 = to_rad(start.lat);
            const λ1 = to_rad(start.lng);
            const α1 = to_rad(bearing);

            const sinα1 = Math.sin(α1), cosα1 = Math.cos(α1);
            const one_minus_f = 1 - f;

            const tanU1 = one_minus_f * Math.tan(φ1);
            const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
            const sinU1 = tanU1 * cosU1;

            const σ1 = Math.atan2(tanU1, cosα1);
            const sinα = cosU1 * sinα1;
            const cosSqα = 1 - sinα * sinα;

            const uSq = cosSqα * (a * a - b * b) / (b * b);
            const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
            const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

            const invBA = 1 / (b * A);
            let σ = distance * invBA;

            const TOL = 1e-6;
            const MAX_ITER = 20;
            let σPrev, sinσ, cosσ, cos2σm, Δσ;

            for (let i = 0; i < MAX_ITER; i++) {
                sinσ = Math.sin(σ);
                cosσ = Math.cos(σ);
                cos2σm = Math.cos(2 * σ1 + σ);

                const t1 = cosσ * (-1 + 2 * cos2σm * cos2σm);
                const t2 = cos2σm * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σm * cos2σm);
                Δσ = B * sinσ * (cos2σm + B / 4 * (t1 - B / 6 * t2));

                σPrev = σ;
                σ = distance * invBA + Δσ;

                if (Math.abs(σ - σPrev) < TOL) {
                    break;
                }
            }

            sinσ = Math.sin(σ);
            cosσ = Math.cos(σ);
            cos2σm = Math.cos(2 * σ1 + σ);

            const x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
            const φ2 = Math.atan2(
                sinU1 * cosσ + cosU1 * sinσ * cosα1,
                one_minus_f * Math.sqrt(sinα * sinα + x * x)
            );

            const λ = Math.atan2(
                sinσ * sinα1,
                cosU1 * cosσ - sinU1 * sinσ * cosα1
            );

            const C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
            const L = λ - one_minus_f * f * sinα * (
                σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * cos2σm * cos2σm))
            );

            const lat2 = to_deg(φ2);
            const lng2 = to_deg(λ1 + L);

            return [lng2, lat2];
        }

        var points = ev.data[0];
        var lngLat = ev.data[1];
        // [-75.0, 45.0] // lng, lat

        for (var i = 0; i < points.length; i += 2) {
            var az = points[i];
            var distance = points[i + 1];
            var calc = mc(dest_vincenty({lng: lngLat.lng, lat: lngLat.lat}, distance * 1000, az));
            points[i] = calc[0];
            points[i + 1] = calc[1];
        }

        self.postMessage(points);
    })
}