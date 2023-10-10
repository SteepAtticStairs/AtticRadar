const work = require('webworkify');

class Level2File {
    constructor (file_buffer, callback) {
        this.file_buffer = file_buffer;
        this.callback = callback;

        this._init();
    }

    _init() {
        const thisobj = this;

        var worker = work(require('./level2_worker'));
        worker.addEventListener('message', function (ev) {
            const type = ev.data.type;
            const data = ev.data.data;

            if (type == 'finished_loading') {
                thisobj.callback(thisobj);
            }

            if (type == 'get_object_path_complete') {
                thisobj._get_object_path_complete(data);
            }
        })
        worker.postMessage({ 'type': 'start_loading', 'data': this.file_buffer }, [this.file_buffer.buffer]);

        this.worker = worker;
    }

    get_object_path(path, callback) {
        this.get_object_path_cb = callback;
        this.worker.postMessage({ 'type': 'get_object_path', 'data': path });
    }
    _get_object_path_complete(data) { if (typeof this.get_object_path_cb === 'function') { this.get_object_path_cb(data); } }
}

module.exports = Level2File;