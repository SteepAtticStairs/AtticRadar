function display_attic_dialog(options) {
    var title = options.title;
    var body = options.body;
    var color = options.color;
    var textColor = options.textColor;

    $('#attic_dialog').show();

    $('#attic_dialog_header_text').html(title);
    $('#attic_dialog_header').css('background-color', color);
    //$('#atticDialogHeaderContainer').css('background-color', color);
    $('#attic_dialog_header').css('color', textColor);
    $('#attic_dialog_close').css('color', textColor);

    $('#attic_dialog_body').scrollTop(0);
    $('#attic_dialog_body').html(body);
}

$('#attic_dialog').on('click', function(e) {
    var clickedTarget = $(e.target).attr('id');
    // if we clicked on the darkened background or on the x button
    if (clickedTarget == 'attic_dialog' || clickedTarget == 'attic_dialog_close') {
        $(this).hide();
    }
})

module.exports = display_attic_dialog;