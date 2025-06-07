const map = require('./map');
const set_layer_order = require('./setLayerOrder');
const map_funcs = require('./mapFunctions');

function change_map_style(style) {
    // const base_url = 'mapbox://styles/mapbox/';

    // const current_map_layers = map.getStyle().layers;
    // const original_sources = map.getStyle().sources;
    // const current_map_sources = Object.keys(original_sources).map(key => ({
    //     id: key,
    //     ...original_sources[key],
    // }));
    // const user_added_layers = current_map_layers.slice(1).slice(-(current_map_layers.length - window.atticData.original_map_layers));
    // const user_added_sources = current_map_sources.slice(1).slice(-(current_map_sources.length - window.atticData.original_map_sources));

    // if (style == 'satellite') {
    //     map.setStyle(base_url + 'satellite-streets-v12');
    // }

    // map.on('style.load', () => {
    //     for (var i = 0; i < user_added_sources.length; i++) {
    //         console.log(user_added_sources[i].id)
    //         map.addSource(user_added_sources[i].id, user_added_sources[i]);
    //     }
    //     for (var i = 0; i < user_added_layers.length; i++) {
    //         map.addLayer(user_added_layers[i]);
    //     }

    //     set_layer_order();
    // })

    if (window.atticData.default_styles == undefined) {
        window.atticData.default_styles = {
            'land': map.getPaintProperty('land', 'background-color'),
            'national_park': map.getPaintProperty('national-park', 'fill-color'),
            'landuse': map.getPaintProperty('landuse', 'fill-color'),
            'water': map.getPaintProperty('water', 'fill-color'),
        }
    }

    function set_dark() {
        const ds = window.atticData.default_styles;
        map.setPaintProperty('land', 'background-color', ds.land);
        map.setPaintProperty('national-park', 'fill-color', ds.national_park);
        map.setPaintProperty('landuse', 'fill-color', ds.landuse);
        map.setPaintProperty('water', 'fill-color', ds.water);
    }
    function set_light() {
        const white = 'rgb(246, 244, 237)';
        const blue = 'rgb(136, 190, 227)';

        map.setPaintProperty('land', 'background-color', white);
        map.setPaintProperty('national-park', 'fill-color', white);
        map.setPaintProperty('landuse', 'fill-color', white);
        map.setPaintProperty('water', 'fill-color', blue);
    }

    set_layer_order();
}

module.exports = change_map_style;