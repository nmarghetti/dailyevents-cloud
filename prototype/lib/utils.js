require('date-utils');

var shortId = require("shortid");

exports.uniqueId = function() {
  return shortId.generate().toUpperCase();
};

exports.getFormattedDate = function(timestamp) {
  var today = new Date(parseInt(timestamp));
  return today.toFormat("YYYYMMDD");
}

exports.getFormattedTime = function(timestamp) {
  var today = new Date(parseInt(timestamp));
  return today.toFormat("HH24MISSLL");
}

function getUtcDate() {
  var now = new Date(); 
  return new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
}