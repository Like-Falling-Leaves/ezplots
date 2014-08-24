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

