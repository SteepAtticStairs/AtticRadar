// https://developer.mozilla.org/en-US/docs/Glossary/Base64
function utf8_to_b64(str) {
    return window.btoa(encodeURIComponent(str));
}

// https://stackoverflow.com/a/7616484
function hash_string(str) {
    var hash = 0,
        i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

module.exports = hash_string;