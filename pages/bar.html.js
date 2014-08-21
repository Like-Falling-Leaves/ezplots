var $ = require('./vendor/jQuery.js');
var bar = require('../jQuery/bar');
var querystring = require('querystring');

$(function () {
  var args = querystring.parse((window.location.search || '').slice(1));
  $('body').css({width: '100%', margin: 0, padding: 0, border: 0});
  if (args.width) $('body').css({width: parseInt(args.width)});
  if (args.height) $('body').css({height: parseInt(args.height)});
  if (args.dataUrl) $.getJSON(args.dataUrl, function (data) { bar(data, $('body'), $); });
  else bar(JSON.parse(args.data || '[]'), $('body'), $);
});
