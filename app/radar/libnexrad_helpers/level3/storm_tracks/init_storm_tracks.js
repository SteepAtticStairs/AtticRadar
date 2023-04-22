function _load_storm_track_product(product, callback) {
    const currentStation = window.atticData.currentStation;
    // imports have to be inside function for some reason
    const loaders_nexrad = require('../../../libnexrad/loaders_nexrad');

    loaders_nexrad.get_latest_level_3_url(currentStation, product, 0, (url) => {
        if (url == null) {
            // nothing here yet
            deal_with_storm_track_layers();
        } else if (window.atticData.curStormTrackURL != url) {
            window.atticData.curStormTrackURL = url;
            deal_with_storm_track_layers();

            loaders_nexrad.return_level_3_factory_from_url(url, (L3Factory) => {
                console.log(L3Factory);
                L3Factory.plot();
                callback();
            })
        }
    })
}

function deal_with_storm_track_layers() {
    const map = require('../../../map/map');

    var storm_track_layers = window.atticData.storm_track_layers;
    if (storm_track_layers != undefined) {
        for (var i in storm_track_layers) {
            if (map.getLayer(storm_track_layers[i])) { map.removeLayer(storm_track_layers[i]) }
            if (map.getSource(storm_track_layers[i])) { map.removeSource(storm_track_layers[i]) }
        }
    }

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
        // _load_storm_track_product('NTV', () => {});
    })
}

module.exports = {
    fetch_data
};