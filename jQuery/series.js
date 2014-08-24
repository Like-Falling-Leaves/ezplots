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
