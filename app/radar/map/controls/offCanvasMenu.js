const createControl = require('./createControl');

createControl({
    'id': 'menuThing',
    'position': 'top-left',
    'icon': 'fa-bars',
    'css': 'margin-top: 100%;'
}, function () {
    $('#offCanvasBtn').click();
    // if (!$('#menuThing').hasClass('icon-selected')) {
    //     $('#menuThing').addClass('icon-selected');
    //     $('#menuThing').removeClass('icon-black');
    // } else if ($('#menuThing').hasClass('icon-selected')) {
    //     $('#menuThing').removeClass('icon-selected');
    //     $('#menuThing').addClass('icon-black');
    // }
})