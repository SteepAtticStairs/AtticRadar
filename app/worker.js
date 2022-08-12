const l3parse = require('../nexrad-level-3-data/src');
const { Level2Radar } = require('../nexrad-level-2-data/src');

module.exports = function (self) {
    self.addEventListener('message', function (ev) {
        //var l2rad = new Level2Radar(ev.data);
        var l3rad = l3parse(ev.data);
        self.postMessage(l3rad);
    });
};