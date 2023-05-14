const ut = require('../../core/utils');
const arm_functions = require('../../core/menu/atticRadarMenu');
const init_event_listeners = require('./file_upload');

const upload_dialog_content = 
`<input type="file" id="hiddenFileUploader" style="display: none">\
<div id="drop_zone">Drop NEXRAD file here</div>`

$('#armrUploadFileBtn').click(() => {
    arm_functions.hideARMwindow();

    ut.displayAtticDialog({
        'title': 'UPLOAD',
        'body': upload_dialog_content,
        'color': 'rgb(76, 143, 195)',
        'textColor': 'black'
    });

    // add file upload listeners
    init_event_listeners();
})