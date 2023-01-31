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

/*
* GPU.js precision tests
* https://github.com/munrocket/double.js/blob/master/webgl/double.glsl
*/

// const earthRadius = 6378137.0;
// const distance = 132.5 * 1000;

// // GPU is a constructor and namespace for browser
// const gpu = new GPU();
// const multiplyMatrix = gpu.createKernel(function (aa, bb) {
//     function add(a, b) { return (b != 0) ? a + b : a; }
//     function sub(a, b) { return (b != 0) ? a - b : a; }
//     function mul(a, b) { return (b != 1) ? a * b : a; }
//     function div(a, b) { return (b != 1) ? a / b : a; }
//     function fma(a, b, c) { return a * b + c; }


//     function fastTwoSum(a, b) {
//         return [add(a, b), sub(b, sub(add(a, b), a))];
//     }

//     function twoSum(a, b) {
//         return [add(a, b), add(sub(b, sub(add(a, b), a)), sub(a, sub(add(a, b), sub(add(a, b), a))))];
//     }

//     function twoProd(a, b) {
//         return [mul(a, b), a * b + -mul(a, b)];
//     }

//     function div22(X, Y) {
//         return fastTwoSum(div(X[0], Y[0]), div(sub(add(sub(sub(X[0], twoProd(div(X[0], Y[0]), Y[0])[0]), twoProd(div(X[0], Y[0]), Y[0])[1]), X[1]), mul(div(X[0], Y[0]), Y[1])), Y[0]));
//     }

//     return div22([aa, 0], [bb, 0]);
//     //return aa / bb;
// }).setOutput([1]);

// const c = multiplyMatrix(distance, earthRadius);

// //console.log(c[0][0] + c[0][1])
// console.log(c[0])
// console.log(distance / earthRadius)

// // const correct = 0.020774091243258023;
// // const normalGL = 0.02077409252524376;
// // const precGL = 0.02077409066259861;

// // console.log(Math.abs(correct - normalGL))
// // console.log(Math.abs(correct - precGL))
// // console.log(Math.abs(correct - normalGL) > Math.abs(correct - precGL))