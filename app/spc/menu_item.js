const map = require('../core/map/map');
const armFunctions = require('../core/menu/atticRadarMenu');
const fetch_spc_data = require('./fetch_data');

function _hide_layers() {
    if (map.getLayer('spc_fill')) {
        // map.setLayoutProperty('spc_fill', 'visibility', 'none');
        // map.setLayoutProperty('spc_border', 'visibility', 'none');
        map.removeLayer('spc_fill');
        map.removeLayer('spc_border');
        map.removeSource('spc_source');
    }
}

function _load_spc_toggleswitch(items_list) {
    for (var i = 0; i < items_list.length; i++) {
        const type = items_list[i][0];
        const category = items_list[i][1];
        const day = items_list[i][2];

        const elem = $(`#armrSPC_${type}-${category}-${day}_BtnSwitchElem`);

        armFunctions.toggleswitchFunctions(elem,
        function() {
            const elem = $('.spcToggleswitchBtn');
            elem.each(index => {
                elem[index].checked = false;
            });
            $(this)[0].checked = true;

            fetch_spc_data(type, category, day);
        },
        function() {
            _hide_layers();
        })
    }
}

_load_spc_toggleswitch([
    ['convective', 'categorical', 'day1'],
    ['convective', 'categorical', 'day2'],
    ['convective', 'categorical', 'day3'],

    ['convective', 'probabalistic', 'day3'],
    // ['convective', 'probabalistic', 'day4'],
    // ['convective', 'probabalistic', 'day5'],
    // ['convective', 'probabalistic', 'day6'],
    // ['convective', 'probabalistic', 'day7'],
    // ['convective', 'probabalistic', 'day8'],

    // ['convective', 'significant_probabalistic', 'day3'],

    ['convective', 'tornado', 'day1'],
    ['convective', 'tornado', 'day2'],
    // ['convective', 'significant_tornado', 'day1'],
    // ['convective', 'significant_tornado', 'day2'],

    ['convective', 'wind', 'day1'],
    ['convective', 'wind', 'day2'],
    // ['convective', 'significant_wind', 'day1'],
    // ['convective', 'significant_wind', 'day2'],

    ['convective', 'hail', 'day1'],
    ['convective', 'hail', 'day2'],
    // ['convective', 'significant_hail', 'day1'],
    // ['convective', 'significant_hail', 'day2'],

    // ['fire', 'dryt', 'day1'],
    // ['fire', 'dryt', 'day2'],

    // ['fire', 'dryt_categorical', 'day3'],
    // ['fire', 'dryt_probabalistic', 'day3'],

    // ['fire', 'windrh', 'day1'],
    // ['fire', 'windrh', 'day2'],
]);