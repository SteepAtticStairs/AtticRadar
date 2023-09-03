function in_iframe() {
    try {
        return window.self == window.top;
    } catch (e) {
        return true;
    }
}

if (in_iframe()) {
    $('#armrAboutBtn').click();
}