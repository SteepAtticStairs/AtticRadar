function set_progress_bar_width(width_percent) {
    if (width_percent >= 100) { width_percent = 100 }
    const elem = document.getElementById('mainProgressBarInner');
    elem.style.right = '4px';
    const width = elem.offsetWidth;
    elem.style.right = `${width - ((width * (width_percent / 100)) - 4)}px`;
}

function set_progress_bar_text(text) {
    document.getElementById('mainProgressBarText').innerHTML = text;
}

function show_progress_bar() {
    $('#progress_bar_screen_background').show();
}

function hide_progress_bar() {
    $('#progress_bar_screen_background').hide();
}

module.exports = {
    set_progress_bar_width,
    set_progress_bar_text,
    show_progress_bar,
    hide_progress_bar
}