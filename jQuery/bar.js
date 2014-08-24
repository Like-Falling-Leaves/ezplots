//
// Simple bar charts
//

var themes = require('./themes.json');
var series = require('./series.js');
var utils = require('./utils.js');

module.exports = bar;

if (typeof(window) != 'undefined') {
  window.ezplots = window.ezplots || {};
  window.ezplots.bar = bar;
  applyThemes(window.ezplots, '');

  var jQuery = window.jQuery || window.$;
  if (jQuery) {
    jQuery.fn.ezbar = bar;
    applyThemes(jQuery.fn, '');
  }
}

function applyThemes(obj, prefix) {
  for (var kk = 0; kk < themes.length; kk ++) {
    obj[prefix + themes[kk].replace(/[.]/g, '_')] = getThemedBar(themes[kk]);
  }
}

function getThemedBar(theme) {
  return function (data, container, $) {
    $ = $ || window.jQuery || window.$;
    utils.loadTheme($, theme);
    return bar.call(this, data, container, $);
  };
}

function bar(data, container, $) {
  $ = $ || window.jQuery || window.$;
  container = container || (this && $(this));

  var normalized = series.normalize(data || series.parseTable(this, $));
  if (!normalized.length) return this;

  container = $('<div>', {'class': 'ezbar'}).appendTo(container);
  var bgtable = $('<table>', {'class': 'ezbar-bg'}).appendTo(container);
  var fgtable = $('<table>', {'class': 'ezbar-fg'}).appendTo(container);
  var minmax = series.getMinMax(normalized);
  var converted = normalized;
  var fixed = false;

  if (minmax.max == minmax.min) {
    fixed = true;
  } else if (minmax.min < 0 ) {
    converted = series.transform(normalized, -minmax.min, 50, (minmax.max - minmax.min));
    minmax = series.getMinMax(converted);
  } else {
    converted = series.transform(normalized, 0, 50, minmax.max);
  }

  for (var kk = 0; kk < normalized.length; kk ++) {
    bgtable.append($('<tr>').append(
      $('<td>', {'class': 'name', colspan: 50}).append(
        $('<div>', {text: normalized[kk].name})
      ),
      $('<td>', {'class': 'value', colspan: 10, text: Math.round(normalized[kk].value).toString()})
    ));
    if (fixed) continue;
    fgtable.append($('<tr>').append(
      $('<td>', {'class': 'name', colspan: Math.round(converted[kk].value)}).append(
        $('<div>', {text: normalized[kk].name})
      ),
      $('<td>', {'class': 'value', colspan: 60 - Math.round(converted[kk].value), text: ' '})
    ));
  }

  return this;
}
