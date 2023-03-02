const np = {
    // https://stackoverflow.com/a/40475362/18758797
    linspace(startValue, stopValue, cardinality) {
        var arr = [];
        var step = (stopValue - startValue) / (cardinality - 1);
        for (var i = 0; i < cardinality; i++) {
            arr.push(startValue + (step * i));
        }
        return arr;
    },
    shape(arr) {
        const numRows = arr.length;
        const numCols = arr[0].length;
        return [numRows, numCols];
    },
    zeros(shape) {
        if (shape.length === 0) {
            return 0;
        } else {
            const arr = new Array(shape[0]);
            for (let i = 0; i < shape[0]; i++) {
                arr[i] = this.zeros(shape.slice(1));
            }
            return arr;
        }
    },
    bincount(arr) {
        const counts = [];
        for (let i = 0; i < arr.length; i++) {
            const val = arr[i];
            if (val >= counts.length) {
                counts.length = val + 1;
                for (let j = counts.length - 1; j >= 0; j--) {
                    if (typeof counts[j] === 'undefined') {
                        counts[j] = 0;
                    }
                }
            }
            counts[val]++;
        }
        return counts;
    }
}

function _copy(array) {
    return JSON.parse(JSON.stringify(array));
}

function _generate2dArray(l2rad) {
    var velocities = [];
    for (var i in l2rad.data[2]) { velocities.push(l2rad.data[2][i].record.velocity.moment_data) }
    return velocities;
}
function _getNyquist(l2rad) {
    var nyquist = l2rad.data[2][0].record.radial.nyquist_velocity / 100;
    return nyquist;
}

function _jumpToMapPosition() {
    // lng: -97.51734430176083, lat: 35.316678641320166, zoom: 11 // KTLX
    // lng: lng: -97.35454576227136, lat: 27.812346235337856, zoom: 6.5 // KCRP
    // map.on('move', (e) => { console.log(map.getCenter()) })
    // map.on('move', (e) => { console.log(map.getZoom()) })
    map.jumpTo({center: [-97.51734430176083, 35.316678641320166], zoom: 11});
}

function _mergeCorrectedVelocities(correctedVelocities, l2rad) {
    for (var i in correctedVelocities) { l2rad.data[2][i].record.velocity.moment_data = correctedVelocities[i] }
    return l2rad;
}

function _createMask(velocities) {
    var mask = _copy(velocities);
    for (var i in velocities) {
        for (var n in velocities[i]) {
            if (velocities[i][n] == null) { mask[i][n] = true }
            else { mask[i][n] = false }
        }
    }
    return mask;
}
// converts "true" to "1" and "false" to "0"
function _uint8mask(mask) {
    var uint8mask = _copy(mask);
    for (var i in mask) {
        for (var n in mask[i]) {
            uint8mask[i][n] = Number(mask[i][n]);
        }
    }
    return uint8mask;
}
function _scaleSweep(velocities, nyquist) {
    var scaled_sweep = _copy(velocities);
    for (var i in velocities) {
        for (var n in velocities[i]) {
            if (velocities[i][n] != null) {
                // extract ray and scale to phase units
                scaled_sweep[i][n] = velocities[i][n] * Math.PI / nyquist;
            } else {
                scaled_sweep[i][n] = null;
            }
        }
    }
    return scaled_sweep;
}

function dealias(l2rad) {
    var velocities = _generate2dArray(l2rad);
    var rays_wrap_around = true;
    var nyquist_vel = _getNyquist(l2rad);

    var sweep_nyquist_vel = nyquist_vel;
    var scaled_sweep = _scaleSweep(velocities, nyquist_vel);
    var sweep_mask = _createMask(velocities);

    var wrapped = _copy(scaled_sweep);
    var mask = _uint8mask(sweep_mask);
    var unwrapped = np.zeros(np.shape(wrapped));
    // unwrap2D(wrapped, mask, unwrapped);
    fetch('./app/radar/level2/wasm/unwrap_2d.wasm')
    .then(response => WebAssembly.instantiateStreaming(response))
    .then(module => {
        const { addArraysInt32, unwrap2D, memory } = module.instance.exports;

        var wrappedFlat = wrapped.flat();
        var maskFlat = mask.flat();
        var unwrappedFlat = unwrapped.flat();

        let offset = 0;
        let length = wrappedFlat.length; // 1000000;

        memory.grow(1);

        const array1 = new Float32Array(memory.buffer, offset, length);
        array1.set(wrappedFlat);
        offset += length * Float32Array.BYTES_PER_ELEMENT;

        const array2 = new Float32Array(memory.buffer, offset, length);
        array2.set(maskFlat);
        offset += length * Float32Array.BYTES_PER_ELEMENT;

        const result = new Float32Array(memory.buffer, offset, length);

        // Call the function.
        // addArraysInt32(
        //     array1.byteOffset,
        //     array2.byteOffset,
        //     result.byteOffset,
        //     length);
        unwrap2D(array1.byteOffset, result.byteOffset, array2.byteOffset, wrapped[0].length, wrapped.length, 0, 0);

        console.log(result)
    });


    _jumpToMapPosition();
    l2rad = _mergeCorrectedVelocities(velocities, l2rad);

    return l2rad;
}

module.exports = dealias;