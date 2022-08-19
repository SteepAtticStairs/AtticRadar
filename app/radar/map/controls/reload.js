const loaders = require('../../loaders');
const ut = require('../../utils');
const createControl = require('./createControl');
var map = require('../map');

createControl({
    'id': 'reloadThing',
    'position': 'top-right',
    'icon': 'fa-arrow-rotate-right',
    'css': 'margin-top: 100%;'
}, function() {
    window.location.reload();
})