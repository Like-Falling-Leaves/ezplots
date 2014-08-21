(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// Simple bar charts
//

module.exports = bar;
var themes = require('./themes.json');

if (typeof(window) != 'undefined') {
  window.ezplots = window.ezplots || {};
  window.ezplots.bar = bar;
  applyThemes(window.ezplots);

  var jQuery = window.jQuery || window.$;
  if (jQuery) {
    jQuery.fn.ezbar = bar;
    applyThemes(jQuery.fn);
  }
}

function applyThemes(obj) {
  for (var kk = 0; kk < themes.length; kk ++) obj[themes.replace(/[.]/g, '_')] = getThemedBar(theme);
}

function getThemedBar(theme) {
  return function (data, container, $) {
    var css = '/s/' + theme + '.min.css';
    theme = theme.replace(/[.]/g, '_');
    $ = $ || window.jQuery || window.$;
    if (!$('link#' + theme).length) {
      $('<link>', {id: theme, type: 'text/css', rel:'stylesheet'}).appendTo($('head')).attr('href', css);
    }
    return bar.call(this, data, container, $);
  };
}

function bar(data, container, $) {
  $ = $ || window.jQuery || window.$;
  container = container || (this && $(this));

  var normalized = normalize(data || parseTable(this, $));
  if (!normalized.length) return;

  container = $('<div>', {'class': 'ezbar'}).appendTo(container);
  var bgtable = $('<table>', {'class': 'ezbar-bg'}).appendTo(container);
  var fgtable = $('<table>', {'class': 'ezbar-fg'}).appendTo(container);
  var minmax = getMinMax(normalized);
  var converted = normalized;
  var fixed = false;

  if (minmax.max == minmax.min) {
    fixed = true;
  } else if (minmax.min < 0 ) {
    converted = transform(normalized, -minmax.min, 50, (minmax.max - minmax.min));
    minmax = getMinMax(converted);
  } else {
    converted = transform(normalized, 0, 50, minmax.max);
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

                   
function transform(data, translate, multiply, divide, roundf) {
  var ret = [];
  var roundf = roundf || Math.round;
  for (var kk = 0; kk < data.length; kk ++) ret.push({
    name: data[kk].name,
    value: roundf((data[kk].value + translate) * multiply / divide)
  });
  return ret;
}

function getMinMax(data) {
  if (!data.length) return {max: 0, min: 0};
  var max = -Infinity, min = Infinity;
  for (var kk = 0; kk < data.length; kk ++) {
    if (data[kk].value > max) max = data[kk].value;
    if (data[kk].value < min) min = data[kk].value;
  }
  return {max: max, min: min};
}

function normalize(data) {
  if (data && data.__normalized) return data;
  return normalizeInPlace(JSON.parse(JSON.stringify(data)));
}
      

function normalizeInPlace(data) {
  var ret;
  try {
    if (data.__normalized) return data;
    else if (data.names && data.values) {
      ret = normalizeInPlace(normalizeNamesValues(data.names, data.values));
    } else if ('length' in data) ret = normalizeArray(data);
    else {
      ret = [];
      for (var name in data) ret.push({name: name, value: data[name]});
      ret = normalizeInPlace(ret);
    }
  } catch (e) {
    ret = [];
  }
  ret.__normalized = true;
  return ret;
}

function normalizeNamesValues(names, values) {
  var max = Math.max(names.length, values.length);
  var ret = [];
  for (var kk = 0; kk < max; kk ++) ret.push({
    name: names[kk] || '',
    value: values[kk]
  });
  return ret;
}


function normalizeArray(data) {
  if (!data.length) return [];
  var ret = [];
  for (var kk = 0; kk < data.length; kk ++) {
    var item = normalizeItem(data[kk], kk);
    if (item) ret.push(item);
  }
  return ret;

  function normalizeItem(item, index) {
    if (!isNaN(parseInt(item))) return {name: index.toString(), value: parseInt(item)};
    if (!item) return;
    if (typeof(item) != 'object') return {name: item.toString(), value: 0};
    if ('length' in item && item.length == 2) return {
      name: item[0].toString(),
      value: (isNaN(parseInt(item[1])) ? 0 : parseInt(item[1]))
    };
    if (item.name || item.value) return {
      name: (('name' in item) ? item.name.toString() : index.toString()),
      value: (isNaN(parseInt(item.value)) ? 0 : parseInt(item.value))
    };
  }
}

function parseTable(container, $) {
  $ = $ || window.jQuery || window.$;
  return container.find('table').first().find('tr').map(function () {
    return $(this).find('td').map(function () { return $(this).text(); });
  });
}

},{"./themes.json":2}],2:[function(require,module,exports){
module.exports=[ "bar.gray" ]

},{}]},{},[1])