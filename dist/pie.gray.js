(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// Simple pie charts
//

module.exports = pie;
var themes = require('./themes.json');
var series = require('./series.js');
var utils = require('./utils.js');

if (typeof(window) != 'undefined') {
  window.ezplots = window.ezplots || {};
  window.ezplots.pie = pie;
  applyThemes(window.ezplots, '');

  var jQuery = window.jQuery || window.$;
  if (jQuery) {
    jQuery.fn.ezpie = pie;
    applyThemes(jQuery.fn, 'ez');
  }
}

function applyThemes(obj, prefix) {
  for (var kk = 0; kk < themes.length; kk ++) {
    obj[prefix + themes[kk].replace(/[.]/g, '_')] = getThemedPie(themes[kk]);
  }
}

function getThemedPie(theme) {
  return function (data, container, $) {
    $ = $ || window.jQuery || window.$;
    utils.loadTheme($, theme);
    return pie.call(this, data, container, $);
  };
}

function pie(data, container, $) {
  $ = $ || window.jQuery || window.$;
  container = container || (this && $(this));

  if (!window.google) {
    window.loadPie = function () { setTimeout(function () { pie(data, container, $); }, 200); };
    var url = '//google.com/jsapi?callback=loadPie&autoload={"modules":[{"name":"visualization","version":"1","callback": "console.log(42);","packages":["corechart","table"]}]}';
    return $.ajax({dataType: 'script', cache: true, url: url});
  }

  var normalized = series.normalize(data || parseTable(this, $));
  if (!normalized.length) return this;

  if (!google.visualization || !google.visualization.PieChart) {
    google.load("visualization", "1", {callback: 'console.log("loaded google visualization");', packages:["corechart"]});
    google.setOnLoadCallback(function () { setTimeout(drawChart, 200); });
  } else drawChart();

  return this;

  function drawChart() {
    container = $('<div>', {'class': 'ezpie'}).css({width: '100%', height: '100%'}).appendTo(container);
    var chart = new google.visualization.PieChart(container[0]);
    var options = {fontSize: '14', fontName: 'Helvetica, Arial', pieSliceText: 'value'};
    options.chartArea = {width: '100%', top: 10};
    options.legend = {position: (normalized.length <= 3 ? 'bottom' : 'left')};
    var data = [['Name', 'Value']];
    $.each(normalized, function (ii, nn) { data.push([nn.name, nn.value]); });
    var table = new google.visualization.arrayToDataTable(data);
    chart.draw(table, options);
  }
}

},{"./series.js":2,"./themes.json":3,"./utils.js":4}],2:[function(require,module,exports){
//
// Helper routines to parse/transform series data.
//

module.exports.transform = transform;
module.exports.getMinMax = getMinMax;
module.exports.normalize = normalize;
module.exports.parseTable = parseTable;
                   
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

},{}],3:[function(require,module,exports){
module.exports=[ "pie.gray" ]

},{}],4:[function(require,module,exports){
//
// Kitchen sink
//

module.exports.getScriptPath = getScriptPath;
module.exports.loadTheme = loadTheme;

function getScriptPath($, regex, replace) {
  var ret = [];
  $('script').each(function () {
    var src = $(this).attr('src');
    if (regex.test(src)) ret.push(src.replace(regex, replace));
  });
  return ret;
}

function loadTheme($, theme) {
  var template = theme.split('.')[0];
  var id = theme.replace('.', '_');
  var css = theme + '.min.css'

  if ($('link#' + id).length) return;
  css = getScriptPath($, new RegExp(template + '[^/]*.js$'), css) || css;
  return $('<link>', {id:id, rel: 'stylesheet'}).appendTo($('head')).attr('href', css);
}


},{}]},{},[1])