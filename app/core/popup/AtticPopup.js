const map = require('../map/map');

class AtticPopup {
    constructor (lngLat, html_content) {
        if (Array.isArray(lngLat)) {
            lngLat = new mapboxgl.LngLat(...lngLat);
        }
        this.lngLat = lngLat;
        this.html_content = html_content;

        this._init();
        // this.add_to_map();
    }

    _init() {
        $('.attic_popup').remove();
        this.attic_popup_div = $('<div>', { 'class': 'attic_popup' }).html(this.html_content);
    }

    add_to_map() {
        $('body').append(this.attic_popup_div);
        this.update_popup_pos();

        map.on('move', this._move);
        map.on('click', this._click);
    }

    remove() {
        this.attic_popup_div.remove();

        map.off('move', this._move);
        map.off('click', this._click);
    }

    update_popup_pos() {
        const pixel_coords = map.project(this.lngLat);

        const left = pixel_coords.x - (this.attic_popup_div.outerWidth() / 2);
        const top = pixel_coords.y - (this.attic_popup_div.outerHeight() - $('#radarHeader').height());
        this.attic_popup_div.css({ 'left': left, 'top': top });
    }

    _move = () => { this.update_popup_pos.apply(this, []) };
    _click = () => { this.remove.apply(this, []) };

    // main() {
    //     var click_lngLat;
    //     var attic_popup_div;
    //     function update_popup_pos(lngLat) {
    //         const pixel_coords = map.project(lngLat);

    //         const left = pixel_coords.x - (attic_popup_div.width() / 2);
    //         attic_popup_div.css({ 'left': left, 'top': pixel_coords.y });
    //     }
    //     function _popup_click(e) {
    //         $('.attic_popup').remove();
    //         attic_popup_div = $('<div>', { 'class': 'attic_popup' });
    //         $('body').append(attic_popup_div);

    //         click_lngLat = e.lngLat;
    //         update_popup_pos(click_lngLat);
    //     }
    //     function _popup_move(e) {
    //         if (click_lngLat != undefined) {
    //             update_popup_pos(click_lngLat);
    //         }
    //     }
    //     map.on('click', _popup_click);
    //     map.on('move', _popup_move);
    // }
}

module.exports = AtticPopup;