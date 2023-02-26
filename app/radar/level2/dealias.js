const pyodideFunctions = require('./pyodide');

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

function dealias(l2rad) {
    var interval_splits = 3;
    var skip_between_rays = 100;
    var skip_along_ray = 100;

    var velocities = _generate2dArray(l2rad);
    var rays_wrap_around = true;
    var nyquist_vel = _getNyquist(l2rad);
    var nyquist_interval = 2 * nyquist_vel;
    var interval_limits = np.linspace(-nyquist_vel, nyquist_vel, interval_splits + 1);

    var vdata = [...velocities];
    var data = [...velocities];

    for (var sweep_slice = 1; sweep_slice < 2; sweep_slice++) {
        var sdata = [...vdata];
        var scorr = [...data];

        //console.log(np.bincount([0, 1, 1, 3, 2, 1, 7]))
        _find_regions(sdata, interval_limits, function(labels, nfeatures) {
            console.log(labels, nfeatures)
            var [edge_sum, edge_count, region_sizes] = _edge_sum_and_count(labels, nfeatures, sdata, rays_wrap_around, skip_between_rays, skip_along_ray);
        });
    }

    _jumpToMapPosition();
    l2rad = _mergeCorrectedVelocities(velocities, l2rad);

    return l2rad;
}

function _find_regions(vel, limits, masterCallback) {
    var label = np.zeros(np.shape(vel));
    var nfeatures = 0;
    function labelArray(limits, vel, callback) {
        var numLimits = limits.length - 1;
        var numProcessed = 0;

        function processLimit() {
            if (numProcessed >= numLimits) {
                callback(); // call the callback function when all limits are processed
                return;
            }

            var lmin = limits[numProcessed];
            var lmax = limits[numProcessed + 1];

            // find connected regions within the limits
            var rows = vel.length;
            var cols = vel[0].length;
            var inp = new Array(rows);
            for (let i = 0; i < rows; i++) {
                inp[i] = new Array(cols);
                for (let j = 0; j < cols; j++) {
                    inp[i][j] = (lmin <= vel[i][j]) && (vel[i][j] < lmax);
                }
            }

            pyodideFunctions.scipy_ndimage_label(inp, function (limit_label, limit_nfeatures) {
                // console.log(limit_label, limit_nfeatures);

                var llshape = np.shape(limit_label);
                for (let i = 0; i < llshape[0]; i++) {
                    for (let j = 0; j < llshape[1]; j++) {
                        if (limit_label[i][j] !== 0) {
                            limit_label[i][j] += nfeatures;
                        }
                    }
                }

                for (let i = 0; i < label.length; i++) {
                    for (let j = 0; j < label[i].length; j++) {
                        label[i][j] += limit_label[i][j];
                    }
                }

                nfeatures += limit_nfeatures;

                numProcessed++;
                processLimit(); // move on to the next limit
            });
        }

        processLimit(); // start processing the first limit
    }

    labelArray(limits, vel, function() {
        masterCallback(label, nfeatures);
    });

    return [vel, limits]
}

function _edge_sum_and_count(labels, nfeatures, data, rays_wrap_around, max_gap_x, max_gap_y) {
    console.log(labels)
    var bincount = np.bincount(labels.flat())
    console.log(bincount)
}
// # This function takes considerable time and would be a good canidate for
// # rewriting in Cython for better performance.
// def _edge_sum_and_count(labels, nfeatures, data,
//                         rays_wrap_around, max_gap_x, max_gap_y):
//     """
//     Return sparse matrices containing the edge sums and counts between regions
//     and a array of the number of gates in each region.
//     """

//     bincount = np.bincount(labels.ravel())
//     num_masked_gates = bincount[0]
//     region_sizes = bincount[1:]

//     total_nodes = np.prod(labels.shape) - num_masked_gates
//     if rays_wrap_around:
//         total_nodes += labels.shape[0] * 2
//     collector = _EdgeCollector(total_nodes)
//     right, bottom = [i-1 for i in labels.shape]

//     for index, label in np.ndenumerate(labels):
//         if label == 0:
//             continue

//         x_index, y_index = index
//         vel = data[x_index, y_index]

//         # left
//         x_check = x_index - 1
//         if x_check == -1 and rays_wrap_around:
//             x_check = right     # wrap around
//         if x_check != -1:
//             neighbor = labels[x_check, y_index]

//             # if the left side gate is masked, keep looking to the left
//             # until we find a valid gate or reach the maximum gap size
//             if neighbor == 0:
//                 for i in range(max_gap_x):
//                     x_check -= 1
//                     if x_check == -1:
//                         if rays_wrap_around:
//                             x_check = right
//                         else:
//                             break
//                     neighbor = labels[x_check, y_index]
//                     if neighbor != 0:
//                         break

//             # add the edge to the collection (if valid)
//             collector.add_edge(label, neighbor, vel)

//         # right
//         x_check = x_index + 1
//         if x_check == right+1 and rays_wrap_around:
//             x_check = 0     # wrap around
//         if x_check != right+1:
//             neighbor = labels[x_check, y_index]

//             # if the right side gate is masked, keep looking to the left
//             # until we find a valid gate or reach the maximum gap size
//             if neighbor == 0:
//                 for i in range(max_gap_x):
//                     x_check += 1
//                     if x_check == right+1:
//                         if rays_wrap_around:
//                             x_check = 0
//                         else:
//                             break
//                     neighbor = labels[x_check, y_index]
//                     if neighbor != 0:
//                         break

//             # add the edge to the collection (if valid)
//             collector.add_edge(label, neighbor, vel)

//         # top
//         y_check = y_index - 1
//         if y_check != -1:
//             neighbor = labels[x_index, y_check]

//             # if the top side gate is masked, keep looking up
//             # until we find a valid gate or reach the maximum gap size
//             if neighbor == 0:
//                 for i in range(max_gap_y):
//                     y_check -= 1
//                     if y_check == -1:
//                         break
//                     neighbor = labels[x_index, y_check]
//                     if neighbor != 0:
//                         break

//             # add the edge to the collection (if valid)
//             collector.add_edge(label, neighbor, vel)

//         # bottom
//         y_check = y_index + 1
//         if y_check != bottom + 1:
//             neighbor = labels[x_index, y_check]

//             # if the top side gate is masked, keep looking up
//             # until we find a valid gate or reach the maximum gap size
//             if neighbor == 0:
//                 for i in range(max_gap_y):
//                     y_check += 1
//                     if y_check == bottom + 1:
//                         break
//                     neighbor = labels[x_index, y_check]
//                     if neighbor != 0:
//                         break

//             # add the edge to the collection (if valid)
//             collector.add_edge(label, neighbor, vel)

//     edge_sum, edge_count = collector.make_edge_matrices(nfeatures)
//     return edge_sum, edge_count, region_sizes

module.exports = dealias;