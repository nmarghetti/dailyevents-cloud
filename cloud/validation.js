var _  = require('underscore');

var beforeSave = Parse.Cloud.beforeSave;

beforeSave('Client', function(request, response) {
  var errors = [];
  _.each(['environment'], function(field) {
    ensureContains(request, field, errors);
  });
  if (errors.length == 0)
    response.success();
  else
    response.error(errors);
});

beforeSave('Group', function(request, response) {
  var errors = [];
  _.each(['code', 'name'], function(field) {
    ensureContains(request, field, errors);
  });
  _.each({ 'code' : 15, 'name' : 30, 'description' : 70, 'time' : 5 }, function(maxLength, field) {
    ensureMaxLength(request, field, maxLength, errors);
  });
  if (errors.length == 0)
    response.success();
  else
    response.error(errors);
});

beforeSave('Status', function(request, response) {
  var errors = [];
  _.each(['groupId', 'date', 'participant', 'reply', 'timestamp', 'timezone'], function(field) {
    ensureContains(request, field, errors);
  });
  _.each({ 'participant' : 20, 'reply' :  3 }, function(maxLength, field) {
    ensureMaxLength(request, field, maxLength, errors);
  });
  _.each({ 'date' : 8 }, function(length, field) {
    ensureLength(request, field, length, errors);
  });
  if (errors.length == 0)
    response.success();
  else
    response.error(errors);
});

beforeSave('Comment', function(request, response) {
  var errors = [];
  _.each(['groupId', 'date', 'participant', 'comment', 'timestamp', 'timezone'], function(field) {
    ensureContains(request, field, errors);
  });
  _.each({ 'participant' : 20, 'comment' :  70 }, function(maxLength, field) {
    ensureMaxLength(request, field, maxLength, errors);
  });
  _.each({ 'date' : 8 }, function(length, field) {
    ensureLength(request, field, length, errors);
  });
  if (errors.length == 0)
    response.success();
  else
    response.error(errors);
});

ensureContains = function(request, key, errors) {
  if (!request.object.has(key))
    errors.push(key + ' is missing');
};

ensureLength = function(request, key, length, errors) {
  var value = request.object.get(key);
  if (value && value.length != length)
    errors.push(key + ' must have exactly' + length + ' characters');
};

ensureMaxLength = function(request, key, maxLength, errors) {
  var value = request.object.get(key);
  if (value && value.length > maxLength)
    errors.push(key + ' cannot have more than ' + maxLength + ' characters');
};
