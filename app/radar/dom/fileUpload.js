const ut = require('../utils');

/*
* https://stackoverflow.com/a/55576752
*/

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;

    // Create the event
    var event = new CustomEvent("loadFile", {
        "detail": [
            files[0],
            2,
            'whole'
        ]
    });
    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);

    ut.disableModeBtn();
    $('#dataDiv').data('fromFileUpload', true);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

document.getElementById('hiddenFileUploader').addEventListener('input', function() {
    // Create the event
    var event = new CustomEvent("loadFile", {
        "detail": [
            document.getElementById('hiddenFileUploader').files[0],
            2,
            'whole'
        ]
    });
    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);

    ut.disableModeBtn();
    $('#dataDiv').data('fromFileUpload', true);
})

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);


function mouseEnter(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'rgb(212, 212, 212)',
    }, 150);
}
function mouseLeave(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'white',
    }, 150);
}
$('#drop_zone').on('mouseenter', function(e) {
    mouseEnter(this);
})
$('#drop_zone').on('mouseleave', function(e) {
    mouseLeave(this);
})
$('#drop_zone').on('click', function(e) {
    $('#hiddenFileUploader').click();
})