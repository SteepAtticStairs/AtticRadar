function deal_with_storm_track_layers() {
    const map = require('../../../map/map');

    var stormTrackLayers = window.atticData.stormTrackLayers;
    if (stormTrackLayers != undefined) {
        for (var i in stormTrackLayers) {
            if (map.getLayer(stormTrackLayers[i])) { map.removeLayer(stormTrackLayers[i]) }
            if (map.getSource(stormTrackLayers[i])) { map.removeSource(stormTrackLayers[i]) }
        }
    }
}

function fetch_data() {
    // imports have to be inside function for some reason
    const loaders_nexrad = require('../../../libnexrad/loaders_nexrad');
    const plot_storm_tracks = require('./plot_storm_tracks');

    const currentStation = window.atticData.currentStation;

    loaders_nexrad.get_latest_level_3_url(currentStation, 'NST', 0, (url) => {
        if (url == null) {
            // nothing here yet
            deal_with_storm_track_layers();
        } else if (window.atticData.curStormTrackURL != url) {
            window.atticData.curStormTrackURL = url;
            deal_with_storm_track_layers();

            loaders_nexrad.return_level_3_factory_from_url(url, (L3Factory) => {
                console.log(L3Factory);
                plot_storm_tracks(L3Factory);
            })
        }
    })
}

module.exports = {
    fetch_data
};