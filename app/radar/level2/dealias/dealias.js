/**
 * This implementation of a region based doppler dealiasing algorithm
 * was ported almost exactly from pyart's "dealias_region_based" function.
 * I used a specific commit as a reference point for this work, because
 * it was right when "scipy.sparse.coo_matrix" had stopped being used
 * by the algorithm.
 * 
 * You can find that commit here:
 * https://github.com/ARM-DOE/pyart/blob/41b34052dc36becd1783bb7dfb87c39570cab707/pyart/correct/region_dealias.py
 * 
 * All of this is to say that I only truly wrote a couple of lines of this code.
 * I simply ported pyart's dealiasing function from Python to JavaScript, with
 * a lot of help from ChatGPT and Google.
 */

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
        var numRows = arr.length;
        var numCols = arr[0].length;
        if (numRows == undefined) { numRows = 1 }
        if (numCols == undefined) { numCols = 1 }
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
    ones_like(arr) {
        return new Array(arr.length).fill(1);
    },
    bincount(arr) {
        // Initialize the result array with zeros up to the maximum value in arr
        let counts = new Array(Math.max(...[...new Set(arr)]) + 1).fill(0);
        // Count the occurrences of each value in arr
        for (let x of arr) {
            counts[x] += 1;
        }
        return counts;
    },
    lexsort(arr1, arr2) {
        const indices = Array.from({ length: arr1.length }, (_, i) => i);
        indices.sort((a, b) => {
            let cmp = arr1[a] - arr1[b];
            if (cmp !== 0) {
                return cmp;
            }
            return arr2[a] - arr2[b];
        });
        return indices;
    },
    nonzero(arr) {
        return arr.reduce((acc, cur, i) => {
            if (cur) {
                acc.push(i);
            }
            return acc;
        }, []);
    },
    argmax(arr) {
        let maxIndex = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > arr[maxIndex]) {
                maxIndex = i;
            }
        }
        return maxIndex;
    },
    add: {
        reduceat(arr, indices) {
            var result = [];
            for (var i = 0; i < indices.length; i++) {
                // if (indices[i + 1] != undefined) {
                    var curIndex = indices[i];
                    var nextIndex = indices[i + 1];
                    if (curIndex > nextIndex) {
                        result.push(curIndex);
                    } else {
                        var sliced = arr.slice(curIndex, nextIndex);
                        var added = sliced.reduce((a, b) => a + b, 0);
                        result.push(added);
                    }
                // }
            }
            return result;
        }
    }
}

function label_image(arr) {
    // create a 2D array to store the labels of each pixel
    let labels = new Array(arr.length).fill(0).map(() => new Array(arr[0].length).fill(0));
    // initialize the label counter
    let label_count = 1;

    // loop over each pixel in the array
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[0].length; j++) {
            // if the pixel is true and has not been labeled yet
            if (arr[i][j] && labels[i][j] == 0) {
                // perform a breadth-first search to label the connected component
                let queue = [[i, j]];
                while (queue.length > 0) {
                    // pop the next pixel off the queue
                    let [row, col] = queue.shift();
                    // label the pixel
                    labels[row][col] = label_count;
                    // add neighboring pixels to the queue
                    for (let [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                        let x = row + dx;
                        let y = col + dy;
                        if (x >= 0 && x < arr.length && y >= 0 && y < arr[0].length && arr[x][y] && labels[x][y] == 0) {
                            queue.push([x, y]);
                            // mark the neighbor as labeled to prevent revisiting it
                            labels[x][y] = -1;
                        }
                    }
                }
                // increment the label counter
                label_count += 1;
            }
        }
    }

    // replace all -1 labels with 0
    for (let i = 0; i < labels.length; i++) {
        for (let j = 0; j < labels[0].length; j++) {
            if (labels[i][j] == -1) {
                labels[i][j] = 0;
            }
        }
    }

    // return the labeled array and the number of regions
    return [labels, label_count - 1];
}

// function _generate2dArray(l2rad, scanNumber) {
//     var velocities = [];
//     for (var i in l2rad.data[scanNumber]) { velocities.push(l2rad.data[scanNumber][i].record.velocity.moment_data) }
//     return velocities;
// }
// function _getNyquist(l2rad, scanNumber) {
//     var nyquist = l2rad.data[scanNumber][0].record.radial.nyquist_velocity / 100;
//     return nyquist;
// }
// function _mergeCorrectedVelocities(correctedVelocities, l2rad, scanNumber) {
//     for (var i in correctedVelocities) { l2rad.data[scanNumber][i].record.velocity.dealias_data = correctedVelocities[i] }
//     return l2rad;
// }

function _jumpToMapPosition() {
    // lng: -97.51734430176083, lat: 35.316678641320166, zoom: 11 // KTLX
    // lng: lng: -97.35454576227136, lat: 27.812346235337856, zoom: 6.5 // KCRP
    // map.on('move', (e) => { console.log(map.getCenter()) })
    // map.on('move', (e) => { console.log(map.getZoom()) })
    map.jumpTo({center: [-97.51734430176083, 35.316678641320166], zoom: 11});
}

function copy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function remove(arr, value) {
    const index = arr.indexOf(value);
    if (index !== -1) {
        arr.splice(index, 1);
    }
    return arr;
}

/**
 * This function dealiases a 2D array of
 * doppler velocity values using a region-based algorithm.
 * 
 * @param {Array} velocities A 2D array containing all of the velocity values.
 * @param {Number} nyquist_vel A number representing the nyquist velocity.
 * 
 * @returns {Array} The corrected 2D array. It is the same as the original,
 * except the aliased regions are corrected.
 */
function dealias(velocities, nyquist_vel) {
    var interval_splits = 3;
    var skip_between_rays = 100;
    var skip_along_ray = 100;
    var centered = true;

    // var velocities = _generate2dArray(l2rad, scanNumber);
    var rays_wrap_around = true;
    // var nyquist_vel = _getNyquist(l2rad, scanNumber);
    var nyquist_interval = 2 * nyquist_vel;
    var interval_limits = np.linspace(-nyquist_vel, nyquist_vel, interval_splits + 1);

    var sdata = copy(velocities); // copy of data for processing
    var scorr = copy(velocities); // copy of data for output

    for (var sweep_slice = 1; sweep_slice < 2; sweep_slice++) {
        var [labels, nfeatures] = _find_regions(sdata, interval_limits);
        var bincount = np.bincount(labels.flat());
        var num_masked_gates = bincount[0];
        var region_sizes = bincount.slice(1);

        var [indices, edge_count, velos] = _edge_sum_and_count(
            labels, num_masked_gates, sdata, rays_wrap_around,
            skip_between_rays, skip_along_ray);

        // find the number of folds in the regions
        var region_tracker = new _RegionTracker(region_sizes);
        var edge_tracker = new _EdgeTracker(indices, edge_count, velos, nyquist_interval, nfeatures + 1);
        while (true) {
            if (_combine_regions(region_tracker, edge_tracker)) {
                break;
            }
        }

        // center sweep if requested, determine a global sweep unfold number
        // so that the average number of gate folds is zero.
        // if (centered) {
        //     var gates_dealiased = region_sizes.reduce((a, b) => a + b, 0);
        //     // var total_folds = np.sum(region_sizes * region_tracker.unwrap_number[1:])
        //     var total_folds = region_sizes.slice(1).reduce((a, b, i) => {
        //         return a + b * region_tracker.unwrap_number[i + 1];
        //     }, 0);
        //     var sweep_offset = parseInt(Math.round(parseFloat(total_folds) / gates_dealiased));
        //     if (sweep_offset != 0) {
        //         region_tracker.unwrap_number -= sweep_offset;
        //     }
        // }

        // dealias the data using the fold numbers
        // start from label 1 to skip masked region
        for (var i = 1; i < nfeatures + 1; i++) {
            var nwrap = region_tracker.unwrap_number[i];
            if (nwrap != 0) {
                // scorr[labels == i] += nwrap * nyquist_interval
                for (let r = 0; r < labels.length; r++) {
                    for (let c = 0; c < labels[0].length; c++) {
                        if (labels[r][c] === i) {
                            scorr[r][c] += nwrap * nyquist_interval;
                        }
                    }
                }
            }
        }
    }

    // _jumpToMapPosition();
    // l2rad = _mergeCorrectedVelocities(scorr, l2rad, scanNumber);

    return scorr;
}

function _combine_regions(region_tracker, edge_tracker) {
    /* Returns True when done. */
    // Edge parameters from edge with largest weight
    var [status, extra] = edge_tracker.pop_edge();
    if (status) {
        return true;
    }
    var [node1, node2, weight, diff, edge_number] = extra;
    var rdiff = parseInt(Math.round(diff));

    // node sizes of nodes to be merged
    var node1_size = region_tracker.get_node_size(node1);
    var node2_size = region_tracker.get_node_size(node2);

    var base_node;
    var merge_node;
    // determine which nodes should be merged
    if (node1_size > node2_size) {
        [base_node, merge_node] = [node1, node2];
    }
    else {
        [base_node, merge_node] = [node2, node1]
        rdiff = -rdiff;
    }

    // unwrap merge_node
    if (rdiff != 0) {
        region_tracker.unwrap_node(merge_node, rdiff);
        edge_tracker.unwrap_node(merge_node, rdiff);
    }

    // merge nodes
    region_tracker.merge_nodes(base_node, merge_node);
    edge_tracker.merge_nodes(base_node, merge_node, edge_number);

    return false;
}

class _EdgeTracker {
    constructor(indices, edge_count, velocities, nyquist_interval, nnodes) {
        /* initialize */

        var nedges = parseInt(indices[0].length / 2);

        // node number and different in sum for each edge
        this.node_alpha = new Array(nedges).fill(0);
        this.node_beta = new Array(nedges).fill(0);
        this.sum_diff = new Array(nedges).fill(0);

        // number of connections between the regions
        this.weight = new Array(nedges).fill(0);

        // fast finding
        this._common_finder = new Array(nnodes).fill(false);
        this._common_index = new Array(nnodes).fill(0);
        this._last_base_node = -1;

        // array of linked lists pointing to each node
        this.edges_in_node = new Array(nnodes).fill(0);
        for (var i = 0; i < nnodes; i++) {
            this.edges_in_node[i] = [];
        }

        // fill out data from the provides indicies, edge counts and velocities
        var edge = 0;
        var [idx1, idx2] = indices;
        var [vel1, vel2] = velocities;

        for (let k = 0; k < idx1.length; k++) {
            var i = idx1[k];
            var j = idx2[k];
            var count = edge_count[k];
            var vel = vel1[k];
            var nvel = vel2[k];

            if (i < j) {
                continue;
            }
            this.node_alpha[edge] = i;
            this.node_beta[edge] = j;
            this.sum_diff[edge] = ((vel - nvel) / nyquist_interval);
            this.weight[edge] = count;
            this.edges_in_node[i].push(edge);
            this.edges_in_node[j].push(edge);

            edge += 1;
        }

        // list which orders edges according to their weight, highest first
        this.priority_queue = [];
    }
    merge_nodes(base_node, merge_node, foo_edge) {
        /* Merge nodes. */

        // remove edge between base and merge nodes
        this.weight[foo_edge] = -999;
        this.edges_in_node[merge_node] = remove(this.edges_in_node[merge_node], foo_edge);
        this.edges_in_node[base_node] = remove(this.edges_in_node[base_node], foo_edge);
        this._common_finder[merge_node] = false;

        // find all the edges in the two nodes
        var edges_in_merge = [...this.edges_in_node[merge_node]];

        // loop over base_node edges if last base_node was different
        if (this._last_base_node != base_node) {
            this._common_finder.fill(false);
            var edges_in_base = [...this.edges_in_node[base_node]];
            for (var edge_num in edges_in_base) {
                edge_num = edges_in_base[edge_num];
                // reverse edge if needed so node_alpha is base_node
                if (this.node_beta[edge_num] == base_node) {
                    this._reverse_edge_direction(edge_num);
                }
                // console.assert(this.node_alpha[edge_num] == base_node);

                // find all neighboring nodes to base_node
                var neighbor = this.node_beta[edge_num];
                this._common_finder[neighbor] = true;
                this._common_index[neighbor] = edge_num;
            }
        }

        // loop over edge nodes
        for (var edge_num in edges_in_merge) {
            edge_num = edges_in_merge[edge_num];
            // reverse edge so that node alpha is the merge_node
            if (this.node_beta[edge_num] == merge_node) {
                this._reverse_edge_direction(edge_num);
            }
            // console.assert(this.node_alpha[edge_num] == merge_node);

            // update all the edges to point to the base node
            this.node_alpha[edge_num] = base_node;

            // if base_node also has an edge with the neighbor combine them
            var neighbor = this.node_beta[edge_num];
            if (this._common_finder[neighbor]) {
                var base_edge_num = this._common_index[neighbor];
                this._combine_edges(base_edge_num, edge_num, merge_node, neighbor);
            } else {
                // if not fill in _common_ arrays.
                this._common_finder[neighbor] = true;
                this._common_index[neighbor] = edge_num;
            }
        }

        // move all edges from merge_node to base_node
        var edges = this.edges_in_node[merge_node];
        this.edges_in_node[base_node].push(...edges);
        this.edges_in_node[merge_node] = [];
        this._last_base_node = parseInt(base_node);
        return;
    }
    _combine_edges(base_edge, merge_edge, merge_node, neighbor_node) {
        /* Combine edges into a single edge. */
        // Merging nodes MUST be set to alpha prior to calling this function

        // combine edge weights
        this.weight[base_edge] += this.weight[merge_edge];
        this.weight[merge_edge] = -999;

        // combine sums
        this.sum_diff[base_edge] += this.sum_diff[merge_edge];

        // remove merge_edge from both node lists
        this.edges_in_node[merge_node] = remove(this.edges_in_node[merge_node], merge_edge);
        this.edges_in_node[neighbor_node] = remove(this.edges_in_node[neighbor_node], merge_edge);
    }
    _reverse_edge_direction(edge) {
        /* Reverse an edges direction, change alpha and beta. */

        // swap nodes
        var old_alpha = parseInt(this.node_alpha[edge]);
        var old_beta = parseInt(this.node_beta[edge]);
        this.node_alpha[edge] = old_beta;
        this.node_beta[edge] = old_alpha;
        // swap sums
        this.sum_diff[edge] = -1 * this.sum_diff[edge];
        return;
    }
    unwrap_node(node, nwrap) {
        /* Unwrap a node. */

        if (nwrap == 0) {
            return;
        }
        // add weight * nwrap to each edge in node
        for (var edge in this.edges_in_node[node]) {
            edge = this.edges_in_node[node][edge];
            var weight = this.weight[edge];
            if (node == this.node_alpha[edge]) {
                this.sum_diff[edge] += weight * nwrap;
            }
            else {
                // console.assert(this.node_beta[edge] == node);
                this.sum_diff[edge] += -weight * nwrap;
            }
        }
        return;
    }
    pop_edge() {
        /* Pop edge with largest weight.  Return node numbers and diff */

        var edge_num = np.argmax(this.weight);
        var node1 = this.node_alpha[edge_num];
        var node2 = this.node_beta[edge_num];
        var weight = this.weight[edge_num];
        var diff = this.sum_diff[edge_num] / (parseFloat(weight));

        if (weight < 0) {
            return [true, null];
        }
        return [false, [node1, node2, weight, diff, edge_num]];
    }
}

class _RegionTracker {
    /* Tracks the location of radar volume regions contained in each node
    * as the network is reduced. */
    constructor(region_sizes) {
        // number of gates in each node
        let nregions = region_sizes.length + 1;
        this.node_size = new Array(nregions).fill(0);
        this.node_size.fill(0, 1, nregions);
        this.node_size.splice(1, region_sizes.length, ...region_sizes);
        // array of lists containing the regions in each node
        this.regions_in_node = new Array(nregions).fill(0);
        for (let i = 0; i < nregions; i++) {
            this.regions_in_node[i] = [i];
        }

        // number of unwrappings to apply to dealias each region
        this.unwrap_number = new Array(nregions).fill(0);
    }

    /* Merge node b into node a. */
    merge_nodes(node_a, node_b) {
        // move all regions from node_b to node_a
        let regions_to_merge = this.regions_in_node[node_b];
        this.regions_in_node[node_a].push(...regions_to_merge);
        this.regions_in_node[node_b] = [];

        // update node sizes
        this.node_size[node_a] += this.node_size[node_b];
        this.node_size[node_b] = 0;
        return;
    }

    /* Unwrap all gates contained a node. */
    unwrap_node(node, nwrap) {
        if (nwrap == 0) {
            return;
        }
        // for each region in node add nwrap
        let regions_to_unwrap = this.regions_in_node[node];
        for (var i = 0; i < regions_to_unwrap.length; i++) {
            this.unwrap_number[regions_to_unwrap[i]] += nwrap;
        }
        return;
    }

    /* Return the number of gates in a node. */
    get_node_size(node) {
        return this.node_size[node];
    }
}

function _edge_sum_and_count(labels, num_masked_gates, data, rays_wrap_around, max_gap_x, max_gap_y) {
    var lShape = np.shape(labels);
    var total_nodes = lShape[0] * lShape[1] - num_masked_gates;
    if (rays_wrap_around) {
        total_nodes += lShape[0] * 2;
    }

    var [indices, velocities] = _fast_edge_finder(labels, data, rays_wrap_around, max_gap_x, max_gap_y, total_nodes);
    var [index1, index2] = indices;
    var [vel1, vel2] = velocities;
    count = np.ones_like(vel1);

    // find the unique edges, procedure based on method in
    // scipy.sparse.coo_matrix.sum_duplicates
    // except we have three data arrays, vel1, vel2, and count
    var order = np.lexsort(index1, index2);
    // console.log(np.lexsort([9,4,0,4,0,2,1], [1,5,1,4,3,4,4]))
    index1 = index1.filter((_, i) => order[i]).map((_, i) => index1[order[i]]);
    index2 = index2.filter((_, i) => order[i]).map((_, i) => index2[order[i]]);
    vel1 = vel1.filter((_, i) => order[i]).map((_, i) => vel1[order[i]]);
    vel2 = vel2.filter((_, i) => order[i]).map((_, i) => vel2[order[i]]);
    count = count.filter((_, i) => order[i]).map((_, i) => count[order[i]]);

    var unique_mask = new Array(index1.length - 1);
    for (let i = 0; i < unique_mask.length; i++) {
        unique_mask[i] = (index1[i + 1] !== index1[i]) || (index2[i + 1] !== index2[i]);
    }
    unique_mask.unshift(true);
    index1 = index1.filter((_, i) => unique_mask[i]);
    index2 = index2.filter((_, i) => unique_mask[i]);

    var unique_inds = np.nonzero(unique_mask);
    vel1 = np.add.reduceat(vel1, unique_inds);
    vel2 = np.add.reduceat(vel2, unique_inds);
    count = np.add.reduceat(count, unique_inds);
    // console.log(np.add.reduceat([0, 1, 2, 3, 4, 5, 6, 7], [0, 4, 1, 5, 2, 6, 3, 7]))
    // console.log(np.add.reduceat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1,3,4,5]))

    return [[index1, index2], count, [vel1, vel2]];
}

function _fast_edge_finder(labels, data, rays_wrap_around, max_gap_x, max_gap_y, total_nodes) {
    var lShape = np.shape(labels);
    var collector = new _EdgeCollector(total_nodes);
    var right = lShape[0] - 1;
    var bottom = lShape[1] - 1;

    for (var x_index = 0; x_index < lShape[0]; x_index++) {
        for (var y_index = 0; y_index < lShape[1]; y_index++) {
            var label = labels[x_index][y_index];
            if (label == 0) {
                continue;
            }

            var vel = data[x_index][y_index];

            // left
            var x_check = x_index - 1;
            if (x_check == -1 && rays_wrap_around) {
                x_check = right; // wrap around
            }
            if (x_check != -1) {
                var neighbor = labels[x_check][y_index];

                // if the left side gate is masked, keep looking to the left
                // until we find a valid gate or reach the maximum gap size
                if (neighbor == 0) {
                    for (var i = 0; i < max_gap_x; i++) {
                        x_check -= 1;
                        if (x_check == -1) {
                            if (rays_wrap_around) {
                                x_check = right;
                            } else {
                                break;
                            }
                        }
                        neighbor = labels[x_check][y_index];
                        if (neighbor != 0) {
                            break;
                        }
                    }
                }
                // add the edge to the collection (if valid)
                var nvel = data[x_check][y_index];
                collector.add_edge(label, neighbor, vel, nvel);
            }

            // right
            var x_check = x_index + 1;
            if (x_check == right + 1 && rays_wrap_around) {
                x_check = 0; // wrap around
            }
            if (x_check != right + 1) {
                var neighbor = labels[x_check][y_index];

                // if the right side gate is masked, keep looking to the left
                // until we find a valid gate or reach the maximum gap size
                if (neighbor == 0) {
                    for (var i = 0; i < max_gap_x; i++) {
                        x_check += 1;
                        if (x_check == right + 1) {
                            if (rays_wrap_around) {
                                x_check = 0;
                            } else {
                                break;
                            }
                        }
                        neighbor = labels[x_check][y_index];
                        if (neighbor != 0) {
                            break;
                        }
                    }
                }
                // add the edge to the collection (if valid)
                var nvel = data[x_check][y_index];
                collector.add_edge(label, neighbor, vel, nvel);
            }

            // top
            var y_check = y_index - 1
            if (y_check != -1) {
                var neighbor = labels[x_index][y_check];

                // if the top side gate is masked, keep looking up
                // until we find a valid gate or reach the maximum gap size
                if (neighbor == 0) {
                    for (var i = 0; i < max_gap_y; i++) {
                        y_check -= 1;
                        if (y_check == -1) {
                            break;
                        }
                        neighbor = labels[x_index][y_check];
                        if (neighbor != 0) {
                            break;
                        }
                    }
                }
                // add the edge to the collection (if valid)
                var nvel = data[x_index][y_check];
                collector.add_edge(label, neighbor, vel, nvel);
            }

            // bottom
            var y_check = y_index + 1
            if (y_check != bottom + 1) {
                var neighbor = labels[x_index][y_check];

                // if the top side gate is masked, keep looking up
                // until we find a valid gate or reach the maximum gap size
                if (neighbor == 0) {
                    for (var i = 0; i < max_gap_y; i++) {
                        y_check += 1;
                        if (y_check == bottom + 1) {
                            break;
                        }
                        neighbor = labels[x_index][y_check];
                        if (neighbor != 0) {
                            break;
                        }
                    }
                }
                // add the edge to the collection (if valid)
                var nvel = data[x_index][y_check];
                collector.add_edge(label, neighbor, vel, nvel);
            }
        }
    }

    var [indices, velocities] = collector.get_indices_and_velocities();
    return [indices, velocities];
}

class _EdgeCollector {
    /* Class for collecting edges, used by _edge_sum_and_count function. */
    constructor(total_nodes) {
        this.l_index = new Array(total_nodes * 4);
        this.n_index = new Array(total_nodes * 4);
        this.l_velo = new Array(total_nodes * 4);
        this.n_velo = new Array(total_nodes * 4);

        this.l_data = this.l_index;
        this.n_data = this.n_index;
        this.lv_data = this.l_velo;
        this.nv_data = this.n_velo;

        this.idx = 0;
    }

    add_edge(label, neighbor, vel, nvel) {
        /* Add an edge. */
        if (neighbor === label || neighbor === 0) {
            // Do not add edges between the same region (circular edges)
            // or edges to masked gates (indicated by a label of 0).
            return 0;
        }
        this.l_data[this.idx] = label;
        this.n_data[this.idx] = neighbor;
        this.lv_data[this.idx] = vel;
        this.nv_data[this.idx] = nvel;
        this.idx += 1;
        return 1;
    }

    get_indices_and_velocities() {
        /* Return the edge indices and velocities. */
        var indices = [this.l_index.slice(0, this.idx), this.n_index.slice(0, this.idx)];
        var velocities = [this.l_velo.slice(0, this.idx), this.n_velo.slice(0, this.idx)];
        return [indices, velocities];
    }
}

function _find_regions(vel, limits) {
    var label = np.zeros(np.shape(vel));
    var nfeatures = 0;

    // mask values
    for (var i in vel) {
        for (var n in vel[i]) {
            if (vel[i][n] == null) {
                vel[i][n] = -64.5;
            }
        }
    }

    for (let i = 0; i < limits.length - 1; i++) {
        const lmin = limits[i];
        const lmax = limits[i + 1];

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

        var [limit_label, limit_nfeatures] = label_image(inp);

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
    }

    return [label, nfeatures];
}

module.exports = dealias;