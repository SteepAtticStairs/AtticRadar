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

    // const headerHeight = $('#atticDialogHeaderContainer').height();
    // var contentHeight = 0;
    // $('#atticDialogBody').children().each(function() { contentHeight = contentHeight + $(this).height() })
    //$('#atticDialogContainer').height(headerHeight + contentHeight);
    // var bodyHeight = $('#atticDialogBody').outerHeight();
    // console.log(bodyHeight)
    // $('#atticDialogContainer').height(bodyHeight);
}

$('#attic_dialog').on('click', function(e) {
    var clickedTarget = $(e.target).attr('id');
    if (clickedTarget == 'attic_dialog' || clickedTarget == 'attic_dialog_close') {
        $(this).hide();
    }
})

module.exports = display_attic_dialog;