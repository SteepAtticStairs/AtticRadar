function _load_storm_track_product(product, callback) {
    const current_station = window.atticData.currentStation;
    // imports have to be inside function for some reason
    const loaders_nexrad = require('../../../libnexrad/loaders_nexrad');

    loaders_nexrad.get_latest_level_3_url(current_station, product, 0, (url) => {
        if (url == null) {
            // nothing here yet
            deal_with_storm_track_layers();
            deal_with_tvs_layers();
        } else {
            loaders_nexrad.return_level_3_factory_from_url(url, (L3Factory) => {
                var desc_str = 'Storm Tracks:';
                if (product == 'NTV') { desc_str = 'Tornado Vortex Signature:' }

                if (L3Factory.get_file_age_in_minutes() <= 30) {
                    function _plot() {
                        console.log(desc_str, L3Factory);
                        L3Factory.plot();
                        callback();
                    }

                    const file_id = L3Factory.generate_unique_id();

                    if (product == 'NST' && window.atticData.current_storm_track_id != file_id) {
                        window.atticData.current_storm_track_id == file_id;
                        deal_with_storm_track_layers();
                        _plot();
                    }
                    if (product == 'NTV' && window.atticData.current_tvs_id != file_id) {
                        window.atticData.current_tvs_id == file_id;
                        deal_with_tvs_layers();
                        _plot();
                    }
                    if (product == 'NMD' && window.atticData.current_nmd_id != file_id) {
                        window.atticData.current_nmd_id == file_id;
                        // deal_with_storm_track_layers();
                        _plot();
                    }
                } else {
                    deal_with_storm_track_layers();
                    deal_with_tvs_layers();
                }
            })
        }
    })
}

function deal_with_storm_track_layers() {
    const map = require('../../../../core/map/map');

    var storm_track_layers = window.atticData.storm_track_layers;
    if (storm_track_layers != undefined) {
        for (var i in storm_track_layers) {
            if (map.getLayer(storm_track_layers[i])) { map.removeLayer(storm_track_layers[i]) }
            if (map.getSource(storm_track_layers[i])) { map.removeSource(storm_track_layers[i]) }
        }
    }
}

function deal_with_tvs_layers() {
    const map = require('../../../../core/map/map');

    var tvs_layers = window.atticData.tvs_layers;
    if (tvs_layers != undefined) {
        for (var i in tvs_layers) {
            if (map.getLayer(tvs_layers[i])) { map.removeLayer(tvs_layers[i]) }
            if (map.getSource(tvs_layers[i])) { map.removeSource(tvs_layers[i]) }
        }
    }
}

function fetch_data() {
    _load_storm_track_product('NST', () => {
        _load_storm_track_product('NTV', () => {});
    })
}

module.exports = {
    fetch_data,
    deal_with_storm_track_layers,
    deal_with_tvs_layers
};