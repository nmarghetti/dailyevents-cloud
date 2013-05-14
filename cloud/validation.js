var _  = require('underscore');

var beforeSave = Parse.Cloud.beforeSave;

beforeSave('Group', function(request, response) {
  _.each(['code', 'name'], function(field) {
    ensureContains(request, response, field);
  });
  _.each({ 'code' : 15, 'name' : 30 }, function(maxLength, field) {
    ensureMaxLength(request, response, field, maxLength);
  });
  response.success();
});

beforeSave('Status', function(request, response) {
  _.each(['group', 'date', 'participant', 'reply', 'timestamp', 'timezone'], function(field) {
    ensureContains(request, response, field);
  });
  _.each({ 'participant' : 20, 'reply' :  3 }, function(maxLength, field) {
    ensureMaxLength(request, response, field, maxLength);
  });
  _.each({ 'date' : 8 }, function(length, field) {
    ensureLength(request, response, field, length);
  });
  response.success();
});

beforeSave('Comment', function(request, response) {
  _.each(['group', 'date', 'participant', 'comment', 'timestamp', 'timezone'], function(field) {
    ensureContains(request, response, field);
  });
  _.each({ 'participant' : 20, 'comment' :  140 }, function(maxLength, field) {
    ensureMaxLength(request, response, field, maxLength);
  });
  _.each({ 'date' : 8 }, function(length, field) {
    ensureLength(request, response, field, length);
  });
  response.success();
});

ensureContains = function(request, response, key) {
  if (!request.object.has(key))
    response.error(key + ' is missing');
};

ensureLength = function(request, response, key, length) {
  if (request.object.get(key).length != length)
    response.error(key + ' must have exactly' + length + ' characters');
};

ensureMaxLength = function(request, response, key, maxLength) {
  if (request.object.get(key).length > maxLength)
    response.error(key + ' cannot have more than ' + maxLength + ' characters');
};
