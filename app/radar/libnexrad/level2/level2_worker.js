const NEXRADLevel2File = require('./level2_parser');
const _ = require('lodash');

var NL2F;

// https://stackoverflow.com/a/6491621/18758797
function byString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

module.exports = function (self) {
    self.addEventListener('message', function (ev) {
        const type = ev.data.type;
        const data = ev.data.data;

        if (type == 'start_loading') {
            new NEXRADLevel2File(data, (file) => {
                console.log(file);
                NL2F = file;

                self.postMessage({ 'type': 'finished_loading', 'data': null });
            })
        }

        if (type == 'get_object_path') {
            const value = _.get(NL2F, data); // byString(NL2F, data);
            self.postMessage({ 'type': 'get_object_path_complete', 'data': value });
        }
    })
}