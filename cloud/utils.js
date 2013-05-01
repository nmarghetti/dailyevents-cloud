var shortId = require('cloud/modules/shortid'),
    moment  = require('moment');

exports.uniqueId = function() {
  return shortId.generate().toUpperCase();
};

exports.getFormattedDate = function(timestamp, timezone) {
  return toLocalDate(timestamp, timezone).format('YYYYMMDD');
}

exports.getFormattedTime = function(timestamp, timezone) {
  return toLocalDate(timestamp, timezone).format('HHmmssSSS');
}

toLocalDate = function(timestamp, timezone) {
  var time = parseInt(timestamp);
  var zone = parseInt(timezone);
  return moment.utc(time).subtract({ m : zone });
};