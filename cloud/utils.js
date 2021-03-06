var  moment = require('moment'),
    shortId = require('./modules/shortid.js');

exports.uniqueId = function() {
  return shortId.generate().toUpperCase();
};

exports.dateString = function(timestamp, timezone) {
  return localDate(timestamp, timezone).format('YYYYMMDD');
}

exports.timeString = function(timestamp, timezone) {
  return localDate(timestamp, timezone).format('HHmmssSSS');
}

localDate = function(timestamp, timezone) {
  var time = parseInt(timestamp);
  var zone = parseInt(timezone);
  return moment.utc(time).subtract({ m : zone });
};
