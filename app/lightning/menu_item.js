const map = require('../radar/map/map');
const load_lightning = require('./load_lightning');

const divElem = '#lightningItemDiv';
const iconElem = '#lightningItemClass';

$(iconElem).on('click', function() {
    if ($(iconElem).hasClass('icon-grey')) {
        $(iconElem).removeClass('icon-grey');
        $(iconElem).addClass('icon-blue');

        if (map.getLayer('lightningLayer')) {
            // lightning layer already exists, simply toggle visibility here
            map.setLayoutProperty('lightningLayer', 'visibility', 'visible');
        } else {
            // lightning layer does not exist, load it into the map style
            load_lightning();
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        // hide the lightning layer
        map.setLayoutProperty('lightningLayer', 'visibility', 'none');
    }
})