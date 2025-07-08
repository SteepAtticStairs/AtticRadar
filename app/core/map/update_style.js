const map = require('./map');

/**
 * Changes a couple things about the map style.
 * Only works on OpenFreeMap's "dark" style.
 */
function update_style() {
    const now = Date.now();
    fetch(window.attic_data.style_url, {
        cache: 'no-store',
    })
    .then(response => response.json())
    .then(style_json => {
        try {
            const uppercase_layers = [];
            for (var i = 0; i < style_json.layers.length; i++) {
                // if the layer text is uppercase, store it for later
                if (style_json.layers[i]?.layout?.['text-transform'] == 'uppercase') {
                    uppercase_layers.push(style_json.layers[i]);
                }
            }

            // we want these layers to remain uppercase (country names)
            const whitelist_layers = ['place_country_major', 'place_country_minor', 'place_country_other']
            for (var x = 0; x < uppercase_layers.length; x++) {
                const layer_id = uppercase_layers[x].id;
                if (!whitelist_layers.includes(layer_id)) {
                    // if it's not whitelisted then remove the forced uppercase
                    map.setLayoutProperty(layer_id, 'text-transform', 'none');
                } else {
                    // if it is whitelisted (e.g. remaining uppercase), brigten the text color a bit
                    map.setPaintProperty(layer_id, 'text-color', 'rgb(200, 200, 200)');
                }
            }

            console.log(`Updated map style in ${Date.now() - now} ms`);
        } catch (error) {
            // just in case openfreemap changes their style json and breaks this very specific code
            console.error(error);
        }
    })
}

update_style();

module.exports = update_style;