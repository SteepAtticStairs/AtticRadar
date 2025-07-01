function update_attribution_div_pos() {
    const elem = $('#attributionDiv');
    const padding = 10;
    elem.css({
        'bottom': (parseFloat($('#map').css('bottom')) + padding) + parseInt(elem.children().css('padding')),
        'right': padding
    });
}

update_attribution_div_pos();

module.exports = update_attribution_div_pos;