const loaders = require('../../../loaders');
const createControl = require('../createControl');

function createModal(title, headerColor, body) {
    var modalContent = 
    `<div class="modal fade" tabindex="-1" aria-labelledby="jsModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header alert ${headerColor}">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">${body}</div>
            </div>
        </div>
    </div>`
    return modalContent;
}

$.get('app/radar/map/controls/help/helpControlContent.html', function(data) {
    var warningModal = $(createModal(
        'Help', 'alert-info', data));

    createControl({
        'id': 'helpThing',
        'position': 'bottom-left',
        'icon': 'fa-question',
        'css': 'margin-top: 100%;'
    }, function() {
        warningModal.modal('show');
    })
})