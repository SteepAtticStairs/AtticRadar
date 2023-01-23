function calcGPU(azDists) {
    console.time('GPU');
    const gpu = new GPU();

    // const array = [1, 2, 3, 4];

    const multiplyMatrix = gpu.createKernel(function (a) {
        function forwardAzimuthProj(az, distance, iter) {
            // convert distance from meters to kilometers
            distance = distance * 1000;
            az = az * (Math.PI / 180);

            // Define the starting latitude and longitude
            const lat1 = 45.0;
            const lon1 = -75.0;

            // Convert the azimuth and starting coordinates to radians
            //const azRad = az * (Math.PI / 180);
            const lat1Rad = lat1 * (Math.PI / 180);
            const lon1Rad = lon1 * (Math.PI / 180);

            // the earth radius in meters
            const earthRadius = 6378137.0;

            // Calculate the destination latitude and longitude in radians
            const lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(distance / earthRadius) + Math.cos(lat1Rad) * Math.sin(distance / earthRadius) * Math.cos(az));
            const lon2Rad = lon1Rad + Math.atan2(Math.sin(az) * Math.sin(distance / earthRadius) * Math.cos(lat1Rad), Math.cos(distance / earthRadius) - Math.sin(lat1Rad) * Math.sin(lat2Rad));

            // Convert the destination latitude and longitude from radians to degrees
            const lat2 = lat2Rad * (180 / Math.PI);
            const lon2 = lon2Rad * (180 / Math.PI);

            const x = (180 + lon2) / 360;
            const y = (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat2 * Math.PI / 360)))) / 360;

            if (iter % 2 == 0) {
                return x;
            } else {
                return y;
            }
        }

        const iter = this.thread.x;
        if (iter % 2 == 0) {
            var az = a[iter];
            var distance = a[iter + 1];
            return forwardAzimuthProj(az, distance, iter);
        } else {
            var az = a[iter - 1];
            var distance = a[iter];
            return forwardAzimuthProj(az, distance, iter);
        }
    }).setOutput([azDists.length]);

    var output = multiplyMatrix(azDists);
    //console.timeEnd('GPU');
    //output = [...output].filter(x => x !== 0);
    //console.log(output);
    return output;
}

module.exports = calcGPU;