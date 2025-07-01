const ut = require('../../core/utils');
const loaders_nexrad = require('../libnexrad/loaders_nexrad');
const map_funcs = require('../../core/map/mapFunctions');
const detect_level = require('../libnexrad/detect_level');
const { deal_with_storm_track_layers, deal_with_tvs_layers } = require('../libnexrad_helpers/level3/storm_tracks/init_storm_tracks');

function reset_everything() {
    // $('#drop_zone').off();
    // $('#drop_zone').replaceWith($('#drop_zone').clone());
    // $('#hiddenFileUploader').off();
    // $('.levelRadioInputs').off();

    // $('#file_upload_contents').append($('#hiddenFileUploader'));
    // $('#file_upload_contents').append($('#drop_zone'));

    $('#atcDlgClose').click();
}

/*
* https://stackoverflow.com/a/55576752
*/

function load_file(files_obj) {
    const uploaded_file = files_obj[0];

    const reader = new FileReader();
    reader.addEventListener('load', function () {
        const filename = uploaded_file.name;
        const buffer = Buffer.from(this.result);
        const detected_radar_level = detect_level(buffer);

        if (detected_radar_level == 3) {
            loaders_nexrad.return_level_3_factory_from_buffer(buffer, (L3Factory) => {
                window.atticData.from_file_upload = true;
                console.log(L3Factory);

                map_funcs.removeMapLayer('baseReflectivity');
                deal_with_storm_track_layers();
                deal_with_tvs_layers();

                // L3Factory.display_file_info();
                L3Factory.plot();

                reset_everything();
            })
        } else if (detected_radar_level == 2) {
            loaders_nexrad.return_level_2_factory_from_buffer(buffer, (L2Factory) => {
                window.atticData.from_file_upload = true;
                console.log(L2Factory);
                // console.log(L2Factory.list_elevations_and_products())

                map_funcs.removeMapLayer('baseReflectivity');
                deal_with_storm_track_layers();
                deal_with_tvs_layers();

                // L2Factory.display_file_info();
                L2Factory.plot('REF', 1);

                reset_everything();
            }, filename);
        } else if (detected_radar_level == undefined) {
            // nothing here yet
            console.error('Level detection failed.');
        }
    }, false);
    reader.readAsArrayBuffer(uploaded_file);
}

function dragEnter(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'rgb(212, 212, 212)',
        'border-width': '5px',
        'border-color': 'rgb(17, 167, 17)'
    }, 150);
}
function dragLeave(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'rgba(0, 0, 0, 0)',
        'border-width': '2px',
        'border-color': 'rgb(136, 136, 136)'
    }, 150);
}

function init_event_listeners() {
    $('#hidden_radar_file_uploader').on('input', () => {
        var files = document.getElementById('hidden_radar_file_uploader').files;
        window.atticData.uploaded_file_name = files[0].name;

        load_file(files);
    })

    const drop_zone = document.getElementById('radar_file_drop_zone');
    drop_zone.addEventListener('dragover', function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, false);
    drop_zone.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();

        const files = e.dataTransfer.files;
        window.atticData.uploaded_file_name = files[0].name;
        load_file(files);
    }, false);

    $('#radar_file_drop_zone').on('mouseenter', function(e) {
        $(this).animate({
            backgroundColor: 'rgb(150, 150, 150)',
        }, 150);
    })
    $('#radar_file_drop_zone').on('mouseleave', function(e) {
        $(this).animate({
            backgroundColor: 'rgba(0, 0, 0, 0)',
        }, 150);
    })
    $('#radar_file_drop_zone').on('dragenter', function(e) {
        dragEnter(this);
    })
    $('#radar_file_drop_zone').on('dragleave drop', function(e) {
        dragLeave(this);
    })
    $('#radar_file_drop_zone').on('click', function(e) {
        $('#hidden_radar_file_uploader').click();
    })

    // // $('#dataDiv').data('currentLevelInput', '2');
    // window.atticData.current_level_input = 3;
    // $('.levelRadioInputs').on('click', function () {
    //     window.atticData.current_level_input = parseInt(this.value);
    //     // $('#dataDiv').data('currentLevelInput', this.value);
    //     $('#drop_zone').text(`Drop Level ${this.value} file here`);
    // })
}

module.exports = init_event_listeners;