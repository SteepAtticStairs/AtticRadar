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

// document.addEventListener('keyup', event => {
//     if (event.code === 'Space') {
//         // const image_url = map.getCanvas().toDataURL();
//         // var image = new Image();
//         // image.src = image_url;
//         // var w = window.open('');
//         // w.document.write(image.outerHTML);

//         var original;
//         function _add_footer() {
//             original = $('#mapFooter').html();
//             const productMapFooter = $('#productMapFooter');

//             $('#mapFooter').html(`<div style="color: #a0a0a0; font-size: 20px"><b style="font-weight: 900">AtticRadar</b> - steepatticstairs.net</div>`);
//             $('#mapFooter').append(productMapFooter);
//         }

//         // $('.mapFooter').hide();
//         // _add_footer();
//         html2canvas(document.body).then(function (canvas) {
//             const image_url = canvas.toDataURL();
//             var image = new Image();
//             image.src = image_url;
//             var w = window.open('');
//             w.document.write(image.outerHTML);

//             // $('.mapFooter').show();
//             // $('#mapFooter').html(original);
//         });
//     }
// })