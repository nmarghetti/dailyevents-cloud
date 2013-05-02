var beforeSave = Parse.Cloud.beforeSave;

beforeSave('Group', function(request, response) {
  ensureContains(request, response, 'code');
  ensureMaxLength(request, response, 'code', 15);
  response.success();
});

beforeSave('RSVP', function(request, response) {
  ensureContains(request, response, 'group');
  ensureContains(request, response, 'date');
  ensureLength(request, response, 'date', 8);
  ensureContains(request, response, 'participant');
  ensureMaxLength(request, response, 'participant', 20);
  ensureContains(request, response, 'reply');
  ensureMaxLength(request, response, 'reply', 3);
  ensureContains(request, response, 'timestamp');
  ensureContains(request, response, 'timezone');
  response.success();
});

beforeSave('Comment', function(request, response) {
  ensureContains(request, response, 'group');
  ensureContains(request, response, 'date');
  ensureLength(request, response, 'date', 8);
  ensureContains(request, response, 'participant');
  ensureMaxLength(request, response, 'participant', 20);
  ensureContains(request, response, 'comment');
  ensureMaxLength(request, response, 'comment', 70);
  ensureContains(request, response, 'timestamp');
  ensureContains(request, response, 'timezone');
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
