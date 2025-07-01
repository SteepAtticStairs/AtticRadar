function display_attic_dialog(options) {
    var title = options.title;
    var body = options.body;
    var color = options.color;
    var textColor = options.textColor;

    $('#atcDlg').show();

    $('#atcDlgHeaderText').html(title);
    $('#atcDlgHeader').css('background-color', color);
    //$('#atticDialogHeaderContainer').css('background-color', color);
    $('#atcDlgHeader').css('color', textColor);
    $('#atcDlgClose').css('color', textColor);

    $('#atcDlgBody').scrollTop(0);
    $('#atcDlgBody').html(body);

    // const headerHeight = $('#atticDialogHeaderContainer').height();
    // var contentHeight = 0;
    // $('#atticDialogBody').children().each(function() { contentHeight = contentHeight + $(this).height() })
    //$('#atticDialogContainer').height(headerHeight + contentHeight);
    // var bodyHeight = $('#atticDialogBody').outerHeight();
    // console.log(bodyHeight)
    // $('#atticDialogContainer').height(bodyHeight);
}

$('#atcDlg').on('click', function(e) {
    var clickedTarget = $(e.target).attr('id');
    if (clickedTarget == 'atcDlg' || clickedTarget == 'atcDlgClose') {
        $(this).hide();
    }
})

module.exports = display_attic_dialog;