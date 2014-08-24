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
