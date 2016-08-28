function $c(c, elm) {
    return Array.prototype.slice.call(
        (elm || document).querySelectorAll(c));
}

function condRange(min, max) {
    if (max == null) {
        max = Infinity;
    }
    return function (n) {
        return min <= +n && +n <= max;
    };
}
