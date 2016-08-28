(function () {

document.addEventListener("DOMContentLoaded", onLoad);

var config = {
    title: {
        show: true,
        margin: 14,
        color: "#666666"
    },
    lines: {
        width: 1.8,
        color: "#666666"
    },
    rows: {
        length: 12,
        margin: 13
    },
    bars: {
        type: "none",
        length: 4,
        color: "#666666",
        firstWidth: 0
    },
    pages: {
        length: 1
    }
};

function getStyle(sel) {
    var rules = document.styleSheets[1].cssRules;

    for (var i = 0; i < rules.length; i++) {
        if (rules[i].selectorText == sel) {
            return rules[i].style;
        }
    }
    return null;
}

function bindConfig(path, cond, callback) {
    path = path.split(".");
    var cat = path[0];
    var prop = path[1];
    var input = document.getElementById(cat + "-" + prop);

    if (input.type == "checkbox") {
        input.checked = config[cat][prop];
    } else {
        input.value = config[cat][prop];
    }
    input.addEventListener("change", function () {
        var v = (this.type == "checkbox") ? this.checked : this.value;

        if (cond == null || cond(v)) {
            config[cat][prop] = v;
            callback(v);
        }
    });

    callback(config[cat][prop]);
}

function updateRowsLength(l) {
    var sheets = $c(".sheet");
    sheets.forEach(function (sheet) {
        var rows = $c(".row", sheet);
        if (rows.length < l) {
            var n = l - rows.length;
            var f = document.createDocumentFragment();
            for (var i = 0; i < n; i++) {
                var row = rows[0].cloneNode(true);
                f.appendChild(row);
            }
            sheet.appendChild(f);
        } else if (rows.length > l) {
            var n = rows.length - l;
            for (var i = 0; i < n; i++) {
                sheet.removeChild(rows[i]);
            }
        }
    });
}

var updateTitleVisibility, updateTitleMargin, updateTitleColor;

(function () {
    var style = getStyle(".title");

    updateTitleVisibility = function (f) {
        style.display = f ? "block" : "none";

        document.getElementById("title-margin").disabled = !f;
        document.getElementById("title-color").disabled = !f;
    };

    updateTitleMargin = function (l) {
        style.marginBottom = l + "mm";
    };

    updateTitleColor = function (c) {
        style.borderBottomColor = c;
    };
})();


var updateLinesWidth = function () {
    var lines = getStyle(".lines div");
    var bar  = getStyle(".measure.bar");
    var bars = getStyle(".measure.bar div");
    var hint = getStyle(".measure.hint div");
    return function (l) {
        lines.height = l + "mm";
        bar.top = l + "mm";
        bars.height = "calc(" + l * 4 + "mm + 5px)";
        hint.height = l + "mm";
        updateRowsMargin(config.rows.margin);
    };
}();

var updateLinesColor = function () {
    var style = getStyle(".lines div");
    return function (c) {
        style.borderBottomColor = c;
    }
}();

var updateRowsMargin = function () {
    var style = getStyle(".row");

    return function (l) {
        style.marginBottom = (l - config.lines.width) + "mm";
    };
}();

function updateBarsType(type) {
    var bars = $c(".measure");

    bars.forEach(function (bar) {
        bar.className = "measure " + type;
    });

    var f = type == "none";
    document.getElementById("bars-length").disabled = f;
    document.getElementById("bars-color").disabled = f;
    document.getElementById("bars-firstWidth").disabled = f;
};

function updateBarsLength (n) {
    var rows = $c(".measure");
    rows.forEach(function (row) {
        var bars = $c("div", row);
        if (bars.length < n) {
            var d = n - bars.length;
            var f = document.createDocumentFragment();
            for (var i = 0; i < d; i++) {
                var bar = bars[0].cloneNode(true);
                f.appendChild(bar);
            }
            row.appendChild(f);
        } else if (bars.length > n) {
            var d = bars.length - n;
            for (var i = 0; i < d; i++) {
                row.removeChild(bars[i]);
            }
        }
    });

    updateBarsWidth();
}

var updateBarsColor = function () {
    var style = getStyle(".measure div");
    return function (c) {
        style.borderRightColor = c;
    }
}();

var updateBarsWidth = function () {
    var first = getStyle(".measure div:first-child");
    var rest  = getStyle(".measure div");
    return function () {
        var n = config.bars.length;
        var f = 100 / n + (+config.bars.firstWidth);
        var r = (100 - f) / (n - 1);
        first.width = f + "%";
        rest.width = r + "%";
    };
}();

function updatePagesLength(n) {
    var sheets = $c(".sheet");
    var parent = sheets[0].parentNode;

    if (sheets.length < n) {
        var d = n - sheets.length;
        var f = document.createDocumentFragment();
        for (var i = 0; i < d; i++) {
            var sheet = sheets[0].cloneNode(true);
            f.appendChild(sheet);
        }
        parent.insertBefore(f, sheets[0].nextSibling);
    } else if (sheets.length > n) {
        var d = sheets.length - n;
        for (var i = 0; i < d; i++) {
            parent.removeChild(sheets[i]);
        }
    }
}

var toggleConfigBox = function () {
    var flag = false;
    return function toggleConfigBox(e) {
        flag = !flag;
        var box = document.querySelector(".config-box");

        box.className = flag ? "config-box open" : "config-box closed";
        e.preventDefault();
        return false;
    };
}();

function exportConfig(config) {
    var cats = Object.keys(config);
    var res = [];

    for (var i = 0; i < cats.length; i++) {
        var cat = cats[i];
        var props = Object.keys(config[cat]);
        for (var j = 0; j < props.length; j++) {
            var prop = props[j];
            var val = encodeURIComponent(config[cat][prop]);
            res.push(cat + "-" + prop + "=" + val);
        }
    }
    return res.join("&");
}

function importConfig(str, config) {
    var params = str.split("&");

    for (var i = 0; i < params.length; i++) {
        var param = params[i].split("=");

        if (param.length == 2) {
            var catprop = param[0].split("-");
            var cat = catprop[0];
            var prop = catprop[1];
            var val = decodeURIComponent(param[1]);

            if (cat in config && prop in config[cat]) {
                var pval = config[cat][prop];

                if (typeof pval == "number") {
                    val = +val;
                } else if (typeof pval == "boolean") {
                    val = val == "false" ? false : true;
                }
                config[cat][prop] = val;
            }
        }
    }
}

function getParmalink(e) {
    e.preventDefault();
    location.search = exportConfig(config);
}

function onLoad() {

    if (location.search.length > 1) {
        importConfig(location.search.slice(1), config);
    }

    bindConfig("title.show", null, updateTitleVisibility);
    bindConfig("title.margin", condRange(2), updateTitleMargin);
    bindConfig("title.color", null, updateTitleColor);
    bindConfig("lines.width", condRange(1), updateLinesWidth);
    bindConfig("lines.color", null, updateLinesColor);
    bindConfig("rows.length", condRange(1, 20), updateRowsLength);
    bindConfig("rows.margin", condRange(0), updateRowsMargin);
    bindConfig("bars.type", null, updateBarsType);
    bindConfig("bars.length", condRange(1), updateBarsLength);
    bindConfig("bars.color", null, updateBarsColor);
    bindConfig("bars.firstWidth", condRange(0), updateBarsWidth);
    bindConfig("pages.length", condRange(1), updatePagesLength);

    document.querySelector(".config-gear").addEventListener("click", toggleConfigBox);
    document.getElementById("get-permalink").addEventListener("click", getParmalink);

}

})();
