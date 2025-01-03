import numpy as np
# import scipy.ndimage as ndimage
# import scipy.sparse as sparse

from pyart.config import get_field_name, get_metadata
from pyart.filters.gatefilter import GateFilter, moment_based_gate_filter

def label_image(arr):
    arr = np.asarray(arr)
    # create an array to store the labels of each pixel
    labels = np.zeros_like(arr, dtype=int)
    # initialize the label counter
    label_count = 1

    # loop over each pixel in the array
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            # if the pixel is true and has not been labeled yet
            if arr[i, j] and labels[i, j] == 0:
                # perform a breadth-first search to label the connected component
                queue = [(i, j)]
                while queue:
                    # pop the next pixel off the queue
                    row, col = queue.pop(0)
                    # label the pixel
                    labels[row, col] = label_count
                    # add neighboring pixels to the queue
                    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                        x, y = row + dx, col + dy
                        if 0 <= x < arr.shape[0] and 0 <= y < arr.shape[1] and arr[x, y] and labels[x, y] == 0:
                            queue.append((x, y))
                            # mark the neighbor as labeled to prevent revisiting it
                            labels[x, y] = -1
                # increment the label counter
                label_count += 1

    # replace all -1 labels with 0
    labels[labels == -1] = 0

    # return the labeled array and the number of regions
    return labels, label_count - 1

# print(label_image([[0,0,1,1,0,0],[0,0,0,1,0,0],[1,1,0,0,1,0],[0,0,0,1,0,0]]))


def _parse_fields(vel_field, corr_vel_field):
    """Parse and return the radar fields for dealiasing."""
    if vel_field is None:
        vel_field = get_field_name("velocity")
    if corr_vel_field is None:
        corr_vel_field = get_field_name("corrected_velocity")
    return vel_field, corr_vel_field


def _parse_nyquist_vel(nyquist_vel, radar, check_uniform):
    """Parse the nyquist_vel parameter, extract from the radar if needed."""
    if nyquist_vel is None:
        nyquist_vel = [
            radar.get_nyquist_vel(i, check_uniform) for i in range(radar.nsweeps)
        ]
    else:  # Nyquist velocity explicitly provided
        try:
            len(nyquist_vel)
        except TypeError:  # expand single value.
            nyquist_vel = [nyquist_vel for i in range(radar.nsweeps)]
    return nyquist_vel


def _parse_gatefilter(gatefilter, radar, **kwargs):
    """Parse the gatefilter, return a valid GateFilter object."""
    # parse the gatefilter parameter
    if gatefilter is None:  # create a moment based filter
        gatefilter = moment_based_gate_filter(radar, **kwargs)
    elif gatefilter is False:
        gatefilter = GateFilter(radar)
    else:
        gatefilter = gatefilter.copy()
    return gatefilter


def _parse_rays_wrap_around(rays_wrap_around, radar):
    """Parse the rays_wrap_around parameter."""
    if rays_wrap_around is None:
        if radar.scan_type == "ppi":
            rays_wrap_around = True
        else:
            rays_wrap_around = False
    return rays_wrap_around


def dealias_region_based(
        radar, interval_splits=3, interval_limits=None,
        skip_between_rays=100, skip_along_ray=100, centered=True,
        nyquist_vel=None, gatefilter=None, rays_wrap_around=None,
        keep_original=True, vel_field=None, corr_vel_field=None, **kwargs):
    """
    Dealias Doppler velocities using a region based algorithm.

    Performs Doppler velocity dealiasing by finding regions of similar
    velocities and unfolding and merging pairs of regions until all
    regions are unfolded.  Unfolding and merging regions is accomplished by
    modeling the problem as a dynamic network reduction.

    Parameters
    ----------
    radar : Radar
        Radar object containing Doppler velocities to dealias.
    interval_splits : int, optional
        Number of segments to split the nyquist interval into when finding
        regions of similar velocity.  More splits creates a larger number of
        initial regions which takes longer to process but may result in better
        dealiasing.  The default value of 3 seems to be a good compromise
        between performance and artifact free dealiasing.  This value
        is not used if the interval_limits parameter is not None.
    interval_limits : array like or None, optional
        Velocity limits used for finding regions of similar velocity.  Should
        cover the entire nyquist interval.  None, the default value, will
        split the Nyquist interval into interval_splits equal sized
        intervals.
    skip_between_rays, skip_along_ray : int, optional
        Maximum number of filtered gates to skip over when joining regions,
        gaps between region larger than this will not be connected.  Parameters
        specify the maximum number of filtered gates between and along a ray.
        Set these parameters to 0 to disable unfolding across filtered gates.
    centered : bool, optional
        True to apply centering to each sweep after the dealiasing algorithm
        so that the average number of unfolding is near 0.  False does not
        apply centering which may results in individual sweeps under or over
        folded by the nyquist interval.
    nyquist_velocity : float, optional
        Nyquist velocity in unit identical to those stored in the radar's
        velocity field.  None will attempt to determine this value from the
        instrument_parameters attribute.
    gatefilter : GateFilter, None or False, optional.
        A GateFilter instance which specified which gates should be
        ignored when performing de-aliasing.  A value of None, the default,
        created this filter from the radar moments using any additional
        arguments by passing them to :py:func:`moment_based_gate_filter`.
        False disables filtering including all gates in the dealiasing.
    rays_wrap_around : bool or None, optional
        True when the rays at the beginning of the sweep and end of the sweep
        should be interpreted as connected when de-aliasing (PPI scans).
        False if they edges should not be interpreted as connected (other scan
        types).  None will determine the correct value from the radar
        scan type.
    keep_original : bool, optional
        True to retain the original Doppler velocity values at gates
        where the dealiasing procedure fails or was not applied. False
        does not replacement and these gates will be masked in the corrected
        velocity field.
    vel_field : str, optional
        Field in radar to use as the Doppler velocities during dealiasing.
        None will use the default field name from the Py-ART configuration
        file.
    corr_vel_field : str, optional
        Name to use for the dealiased Doppler velocity field metadata.  None
        will use the default field name from the Py-ART configuration file.

    Returns
    -------
    corr_vel : dict
        Field dictionary containing dealiased Doppler velocities.  Dealiased
        array is stored under the 'data' key.

    """
    # parse function parameters
    vel_field, corr_vel_field = _parse_fields(vel_field, corr_vel_field)
    gatefilter = _parse_gatefilter(gatefilter, radar, **kwargs)
    rays_wrap_around = _parse_rays_wrap_around(rays_wrap_around, radar)
    nyquist_vel = _parse_nyquist_vel(nyquist_vel, radar, True)[0]
    nyquist_interval = 2. * nyquist_vel

    # find nyquist interval segmentation limits
    if interval_limits is None:
        interval_limits = np.linspace(
            -nyquist_vel, nyquist_vel, interval_splits+1, endpoint=True)

    # exclude masked and invalid velocity gates
    gatefilter.exclude_masked(vel_field)
    gatefilter.exclude_invalid(vel_field)
    gfilter = gatefilter.gate_excluded

    # perform dealiasing
    vdata = radar.fields[vel_field]['data'].view(np.ndarray)
    data = vdata.copy()     # dealiased velocities

    for sweep_slice in radar.iter_slice():      # loop over sweeps

        # extract sweep data
        sdata = vdata[sweep_slice].copy()   # is a copy needed here?
        scorr = data[sweep_slice]
        sfilter = gfilter[sweep_slice]

        # find regions in original data
        labels, nfeatures = _find_regions(sdata, sfilter, interval_limits)
        bincount = np.bincount(labels.ravel())
        num_masked_gates = bincount[0]
        region_sizes = bincount[1:]

        # find all edges between regions
        indices, edge_count, velos = _edge_sum_and_count(
            labels, num_masked_gates, sdata, rays_wrap_around,
            skip_between_rays, skip_along_ray)

        # find the number of folds in the regions
        region_tracker = _RegionTracker(region_sizes)
        edge_tracker = _EdgeTracker(indices, edge_count, velos,
                                    nyquist_interval, nfeatures+1)
        while True:
            if _combine_regions(region_tracker, edge_tracker):
                break

        # center sweep if requested, determine a global sweep unfold number
        # so that the average number of gate folds is zero.
        if centered:
            gates_dealiased = region_sizes.sum()
            total_folds = np.sum(
                region_sizes * region_tracker.unwrap_number[1:])
            sweep_offset = int(round(float(total_folds) / gates_dealiased))
            if sweep_offset != 0:
                region_tracker.unwrap_number -= sweep_offset

        # dealias the data using the fold numbers
        # start from label 1 to skip masked region
        for i in range(1, nfeatures+1):
            nwrap = region_tracker.unwrap_number[i]
            if nwrap != 0:
                scorr[labels == i] += nwrap * nyquist_interval

    # mask filtered gates
    if np.any(gfilter):
        data = np.ma.array(data, mask=gfilter)

    # restore original values where dealiasing not applied
    if keep_original:
        data[gfilter] = radar.fields[vel_field]['data'][gfilter]

    # return field dictionary containing dealiased Doppler velocities
    corr_vel = get_metadata(corr_vel_field)
    corr_vel['data'] = data
    return corr_vel


def _find_regions(vel, gfilter, limits):
    """
    Find regions of similar velocity.

    For each pair of values in the limits array (or list) find all connected
    velocity regions within these limits.

    Parameters
    ----------
    vel : 2D ndarray
        Array containing velocity data for a single sweep.
    gfilter : 2D ndarray
        Filter indicating if a particular gate should be masked.  True
        indicates the gate should be masked (excluded).
    limits : array like
        Velocity limits for region finding.  For each pair of limits, taken
        from elements i and i+1 of the array, all connected regions with
        velocities within these limits will be found.

    Returns
    -------
    label : ndarray
        Interger array with each region labeled by a value.  The array
        ranges from 0 to nfeatures, inclusive, where a value of 0 indicates
        masked gates and non-zero indicates a region of connected gates.
    nfeatures : int
        Number of regions found.

    """
    mask = ~gfilter
    label = np.zeros(vel.shape, dtype=np.int32)
    nfeatures = 0
    for lmin, lmax in zip(limits[:-1], limits[1:]):

        # find connected regions within the limits
        inp = (lmin <= vel) & (vel < lmax) & mask
        limit_label, limit_nfeatures = label_image(inp)

        # add these regions to the global regions
        limit_label[np.nonzero(limit_label)] += nfeatures
        label += limit_label
        nfeatures += limit_nfeatures

    return label, nfeatures


def _edge_sum_and_count(labels, num_masked_gates, data,
                        rays_wrap_around, max_gap_x, max_gap_y):
    """
    Find all edges between labels regions.

    Returns the indices, count and velocities of all edges.
    """
    total_nodes = labels.shape[0] * labels.shape[1] - num_masked_gates
    if rays_wrap_around:
        total_nodes += labels.shape[0] * 2

    indices, velocities = fef(
        labels.astype('int32'), data.astype('float32'),
        rays_wrap_around, max_gap_x, max_gap_y, total_nodes)
    index1, index2 = indices
    vel1, vel2 = velocities
    count = np.ones_like(vel1, dtype=np.int32)

    # find the unique edges, procedure based on method in
    # scipy.sparse.coo_matrix.sum_duplicates
    # except we have three data arrays, vel1, vel2, and count
    order = np.lexsort((index1, index2))
    index1 = index1[order]
    index2 = index2[order]
    vel1 = vel1[order]
    vel2 = vel2[order]
    count = count[order]

    unique_mask = ((index1[1:] != index1[:-1]) |
                   (index2[1:] != index2[:-1]))
    unique_mask = np.append(True, unique_mask)
    index1 = index1[unique_mask]
    index2 = index2[unique_mask]

    unique_inds, = np.nonzero(unique_mask)
    vel1 = np.add.reduceat(vel1, unique_inds, dtype=vel1.dtype)
    vel2 = np.add.reduceat(vel2, unique_inds, dtype=vel2.dtype)
    count = np.add.reduceat(count, unique_inds, dtype=count.dtype)

    return (index1, index2), count, (vel1, vel2)


def _combine_regions(region_tracker, edge_tracker):
    """ Returns True when done. """
    # Edge parameters from edge with largest weight
    status, extra = edge_tracker.pop_edge()
    if status:
        return True
    node1, node2, weight, diff, edge_number = extra
    rdiff = int(np.round(diff))

    # node sizes of nodes to be merged
    node1_size = region_tracker.get_node_size(node1)
    node2_size = region_tracker.get_node_size(node2)

    # determine which nodes should be merged
    if node1_size > node2_size:
        base_node, merge_node = node1, node2
    else:
        base_node, merge_node = node2, node1
        rdiff = -rdiff

    # unwrap merge_node
    if rdiff != 0:
        region_tracker.unwrap_node(merge_node, rdiff)
        edge_tracker.unwrap_node(merge_node, rdiff)

    # merge nodes
    region_tracker.merge_nodes(base_node, merge_node)
    edge_tracker.merge_nodes(base_node, merge_node, edge_number)

    return False


class _RegionTracker(object):
    """
    Tracks the location of radar volume regions contained in each node
    as the network is reduced.
    """

    def __init__(self, region_sizes):
        """ initalize. """
        # number of gates in each node
        nregions = len(region_sizes) + 1
        self.node_size = np.zeros(nregions, dtype='int32')
        self.node_size[1:] = region_sizes[:]

        # array of lists containing the regions in each node
        self.regions_in_node = np.zeros(nregions, dtype='object')
        for i in range(nregions):
            self.regions_in_node[i] = [i]

        # number of unwrappings to apply to dealias each region
        self.unwrap_number = np.zeros(nregions, dtype='int32')

    def merge_nodes(self, node_a, node_b):
        """ Merge node b into node a. """

        # move all regions from node_b to node_a
        regions_to_merge = self.regions_in_node[node_b]
        self.regions_in_node[node_a].extend(regions_to_merge)
        self.regions_in_node[node_b] = []

        # update node sizes
        self.node_size[node_a] += self.node_size[node_b]
        self.node_size[node_b] = 0
        return

    def unwrap_node(self, node, nwrap):
        """ Unwrap all gates contained a node. """
        if nwrap == 0:
            return
        # for each region in node add nwrap
        regions_to_unwrap = self.regions_in_node[node]
        self.unwrap_number[regions_to_unwrap] += nwrap
        return

    def get_node_size(self, node):
        """ Return the number of gates in a node. """
        return self.node_size[node]


class _EdgeTracker(object):
    """ A class for tracking edges in a dynamic network. """

    def __init__(self, indices, edge_count, velocities, nyquist_interval,
                 nnodes):
        """ initialize """

        nedges = int(len(indices[0]) / 2)

        # node number and different in sum for each edge
        self.node_alpha = np.zeros(nedges, dtype=np.int32)
        self.node_beta = np.zeros(nedges, dtype=np.int32)
        self.sum_diff = np.zeros(nedges, dtype=np.float32)

        # number of connections between the regions
        self.weight = np.zeros(nedges, dtype=np.int32)

        # fast finding
        self._common_finder = np.zeros(nnodes, dtype=bool)
        self._common_index = np.zeros(nnodes, dtype=np.int32)
        self._last_base_node = -1

        # array of linked lists pointing to each node
        self.edges_in_node = np.zeros(nnodes, dtype='object')
        for i in range(nnodes):
            self.edges_in_node[i] = []

        # fill out data from the provides indicies, edge counts and velocities
        edge = 0
        idx1, idx2 = indices
        vel1, vel2 = velocities
        for i, j, count, vel, nvel in zip(idx1, idx2, edge_count, vel1, vel2):
            if i < j:
                continue
            self.node_alpha[edge] = i
            self.node_beta[edge] = j
            self.sum_diff[edge] = ((vel - nvel) / nyquist_interval)
            self.weight[edge] = count
            self.edges_in_node[i].append(edge)
            self.edges_in_node[j].append(edge)

            edge += 1

        # list which orders edges according to their weight, highest first
        # TODO
        self.priority_queue = []

    def merge_nodes(self, base_node, merge_node, foo_edge):
        """ Merge nodes. """

        # remove edge between base and merge nodes
        self.weight[foo_edge] = -999
        self.edges_in_node[merge_node].remove(foo_edge)
        self.edges_in_node[base_node].remove(foo_edge)
        self._common_finder[merge_node] = False

        # find all the edges in the two nodes
        edges_in_merge = list(self.edges_in_node[merge_node])

        # loop over base_node edges if last base_node was different
        if self._last_base_node != base_node:
            self._common_finder[:] = False
            edges_in_base = list(self.edges_in_node[base_node])
            for edge_num in edges_in_base:

                # reverse edge if needed so node_alpha is base_node
                if self.node_beta[edge_num] == base_node:
                    self._reverse_edge_direction(edge_num)
                assert self.node_alpha[edge_num] == base_node

                # find all neighboring nodes to base_node
                neighbor = self.node_beta[edge_num]
                self._common_finder[neighbor] = True
                self._common_index[neighbor] = edge_num

        # loop over edge nodes
        for edge_num in edges_in_merge:

            # reverse edge so that node alpha is the merge_node
            if self.node_beta[edge_num] == merge_node:
                self._reverse_edge_direction(edge_num)
            assert self.node_alpha[edge_num] == merge_node

            # update all the edges to point to the base node
            self.node_alpha[edge_num] = base_node

            # if base_node also has an edge with the neighbor combine them
            neighbor = self.node_beta[edge_num]
            if self._common_finder[neighbor]:
                base_edge_num = self._common_index[neighbor]
                self._combine_edges(base_edge_num, edge_num,
                                    merge_node, neighbor)
            # if not fill in _common_ arrays.
            else:
                self._common_finder[neighbor] = True
                self._common_index[neighbor] = edge_num

        # move all edges from merge_node to base_node
        edges = self.edges_in_node[merge_node]
        self.edges_in_node[base_node].extend(edges)
        self.edges_in_node[merge_node] = []
        self._last_base_node = int(base_node)
        return

    def _combine_edges(self, base_edge, merge_edge,
                       merge_node, neighbor_node):
        """ Combine edges into a single edge.  """
        # Merging nodes MUST be set to alpha prior to calling this function

        # combine edge weights
        self.weight[base_edge] += self.weight[merge_edge]
        self.weight[merge_edge] = -999.

        # combine sums
        self.sum_diff[base_edge] += self.sum_diff[merge_edge]

        # remove merge_edge from both node lists
        self.edges_in_node[merge_node].remove(merge_edge)
        self.edges_in_node[neighbor_node].remove(merge_edge)

        # TODO priority queue
        # remove merge_edge from edge priority queue
        # self.priority_queue.remove(merge_edge)

        # relocate base_edge in priority queue
        # self.priority_queue.sort()

    def _reverse_edge_direction(self, edge):
        """ Reverse an edges direction, change alpha and beta. """
        # swap nodes
        old_alpha = int(self.node_alpha[edge])
        old_beta = int(self.node_beta[edge])
        self.node_alpha[edge] = old_beta
        self.node_beta[edge] = old_alpha
        # swap sums
        self.sum_diff[edge] = -1. * self.sum_diff[edge]
        return

    def unwrap_node(self, node, nwrap):
        """ Unwrap a node. """
        if nwrap == 0:
            return
        # add weight * nwrap to each edge in node
        for edge in self.edges_in_node[node]:
            weight = self.weight[edge]
            if node == self.node_alpha[edge]:
                self.sum_diff[edge] += weight * nwrap
            else:
                assert self.node_beta[edge] == node
                self.sum_diff[edge] += -weight * nwrap
        return

    def pop_edge(self):
        """ Pop edge with largest weight.  Return node numbers and diff """

        # if len(priority_queue) == 0:
        #     return True, None

        # edge_num = self.priority_queue[0]
        edge_num = np.argmax(self.weight)
        node1 = self.node_alpha[edge_num]
        node2 = self.node_beta[edge_num]
        weight = self.weight[edge_num]
        diff = self.sum_diff[edge_num] / (float(weight))

        if weight < 0:
            return True, None
        return False, (node1, node2, weight, diff, edge_num)

def fef(
        labels, data, rays_wrap_around,
        max_gap_x, max_gap_y, total_nodes):
    """
    Return the gate indices and velocities of all edges between regions.
    """

    collector = _EdgeCollector(total_nodes)
    right = labels.shape[0] - 1
    bottom = labels.shape[1] - 1

    for x_index in range(labels.shape[0]):
        for y_index in range(labels.shape[1]):

            label = labels[x_index, y_index]
            if label == 0:
                continue

            vel = data[x_index, y_index]

            # left
            x_check = x_index - 1
            if x_check == -1 and rays_wrap_around:
                x_check = right     # wrap around
            if x_check != -1:
                neighbor = labels[x_check, y_index]

                # if the left side gate is masked, keep looking to the left
                # until we find a valid gate or reach the maximum gap size
                if neighbor == 0:
                    for i in range(max_gap_x):
                        x_check -= 1
                        if x_check == -1:
                            if rays_wrap_around:
                                x_check = right
                            else:
                                break
                        neighbor = labels[x_check, y_index]
                        if neighbor != 0:
                            break

                # add the edge to the collection (if valid)
                nvel = data[x_check, y_index]
                collector.add_edge(label, neighbor, vel, nvel)

            # right
            x_check = x_index + 1
            if x_check == right+1 and rays_wrap_around:
                x_check = 0     # wrap around
            if x_check != right+1:
                neighbor = labels[x_check, y_index]

                # if the right side gate is masked, keep looking to the left
                # until we find a valid gate or reach the maximum gap size
                if neighbor == 0:
                    for i in range(max_gap_x):
                        x_check += 1
                        if x_check == right+1:
                            if rays_wrap_around:
                                x_check = 0
                            else:
                                break
                        neighbor = labels[x_check, y_index]
                        if neighbor != 0:
                            break

                # add the edge to the collection (if valid)
                nvel = data[x_check, y_index]
                collector.add_edge(label, neighbor, vel, nvel)

            # top
            y_check = y_index - 1
            if y_check != -1:
                neighbor = labels[x_index, y_check]

                # if the top side gate is masked, keep looking up
                # until we find a valid gate or reach the maximum gap size
                if neighbor == 0:
                    for i in range(max_gap_y):
                        y_check -= 1
                        if y_check == -1:
                            break
                        neighbor = labels[x_index, y_check]
                        if neighbor != 0:
                            break

                # add the edge to the collection (if valid)
                nvel = data[x_index, y_check]
                collector.add_edge(label, neighbor, vel, nvel)

            # bottom
            y_check = y_index + 1
            if y_check != bottom + 1:
                neighbor = labels[x_index, y_check]

                # if the top side gate is masked, keep looking up
                # until we find a valid gate or reach the maximum gap size
                if neighbor == 0:
                    for i in range(max_gap_y):
                        y_check += 1
                        if y_check == bottom + 1:
                            break
                        neighbor = labels[x_index, y_check]
                        if neighbor != 0:
                            break

                # add the edge to the collection (if valid)
                nvel = data[x_index, y_check]
                collector.add_edge(label, neighbor, vel, nvel)

    indices, velocities = collector.get_indices_and_velocities()
    return indices, velocities

class _EdgeCollector:
    """
    Class for collecting edges, used by _edge_sum_and_count function.
    """

    def __init__(self, total_nodes):
        """ initalize. """
        self.l_index = np.zeros(total_nodes * 4, dtype=np.int32)
        self.n_index = np.zeros(total_nodes * 4, dtype=np.int32)
        self.l_velo = np.zeros(total_nodes * 4, dtype=np.float64)
        self.n_velo = np.zeros(total_nodes * 4, dtype=np.float64)

        self.l_data = self.l_index
        self.n_data = self.n_index
        self.lv_data = self.l_velo
        self.nv_data = self.n_velo

        self.idx = 0

    def add_edge(self, label, neighbor, vel, nvel):
        """ Add an edge. """
        if neighbor == label or neighbor == 0:
            # Do not add edges between the same region (circular edges)
            # or edges to masked gates (indicated by a label of 0).
            return 0
        self.l_data[self.idx] = label
        self.n_data[self.idx] = neighbor
        self.lv_data[self.idx] = vel
        self.nv_data[self.idx] = nvel
        self.idx += 1
        return 1

    def get_indices_and_velocities(self):
        """ Return the edge indices and velocities. """
        indices = (self.l_index[:self.idx], self.n_index[:self.idx])
        velocities = (self.l_velo[:self.idx], self.n_velo[:self.idx])
        return indices, velocities