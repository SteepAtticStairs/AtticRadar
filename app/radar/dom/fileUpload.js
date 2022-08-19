const ut = require('../utils');

/*
* https://stackoverflow.com/a/55576752
*/

function dispatchEvent(filesObj) {
    // Create the event
    var event = new CustomEvent("loadFile", {
        "detail": [
            filesObj[0],
            parseInt($('#dataDiv').data('currentLevelInput')),
            'whole'
        ]
    });
    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);

    ut.disableModeBtn();
    $('#dataDiv').data('fromFileUpload', true);
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;

    dispatchEvent(files);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

document.getElementById('hiddenFileUploader').addEventListener('input', function() {
    var files = document.getElementById('hiddenFileUploader').files;
    $('#dataDiv').data('fileName', files[0].name)

    dispatchEvent(files);
})

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);


function dragEnter(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'rgb(212, 212, 212)',
        'border-width': '5px',
        'border-color': 'rgb(17, 167, 17)'
    }, 150);
}
function dragLeave(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'white',
        'border-width': '1px',
        'border-color': 'rgb(72, 72, 72)'
    }, 150);
}
$('#drop_zone').on('mouseenter', function(e) {
    $(this).animate({
        backgroundColor: 'rgb(212, 212, 212)',
    }, 150);
})
$('#drop_zone').on('dragenter', function(e) {
    dragEnter(this);
})
$('#drop_zone').on('mouseleave', function(e) {
    $(this).animate({
        backgroundColor: 'white',
    }, 150);
})
$('#drop_zone').on('dragleave', function(e) {
    dragLeave(this);
})
$('#drop_zone').on('click', function(e) {
    $('#hiddenFileUploader').click();
})

$('#dataDiv').data('currentLevelInput', '2');
$('.levelRadioInputs').on('click', function() {
    $('#dataDiv').data('currentLevelInput', this.value);
    document.getElementById('drop_zone').innerHTML = `Drop Level ${this.value} file here`;
})