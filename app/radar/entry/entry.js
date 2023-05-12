/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
    // load the main file
    require('../main');
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    load();
} else if (document.readyState == 'loading') {
    window.onload = function() {
        load();
    }
}