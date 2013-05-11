var services = require('./services');

exports.index = function(req, res) {
  res.render('index', {});
};

/**
 * POST /api/groups
 */
exports.createGroup = function(req, res) {
  services.createGroup(function(error, result) {
    if (error)
      sendServerError('createGroup', res, error);
    else
      sendData(res, { id : result });
  });
};

/**
 * GET /api/groups/PEYMCJU8B5?timestamp=1364250830942
 * => { "participants" : {}, "comments" : {} }
 */
exports.getGroup = function(req, res) {
  var group     = req.params.group;
  var timestamp = req.query['timestamp'];

  if (timestamp) {
    var data = {};
    services.getParticipants(group, timestamp, function(error, result) {
      if (error) {
        sendServerError('getGroup:getParticipants', res, error);
      }
      else {
        data.participants = result;
        services.getComments(group, timestamp, function(error, result) {
          if (error) {
            sendServerError('getGroup:getComments', res, error);
          }
          else {
            data.comments = result;
            sendData(res, data);
          }
        });
      }
    });
  }
  else {
    var errors = [];
    if (!timestamp) errors.push('timestamp is missing');
    sendBadRequest(res, errors);
  }
};

/**
 * POST /api/rsvp/PEYMCJU8B5?timestamp=1364250830942
 * user=tfernandez&reply=yes (application/x-www-form-urlencoded)
 */
exports.rsvp = function(req, res) {
  var group     = req.params.group;
  var user      = req.body.user;
  var reply     = req.body.reply;
  var timestamp = req.query['timestamp'];

  if (user && reply && timestamp) {
    services.rsvp(group, user, reply, timestamp, function(error, result) {
      if (error)
        sendServerError('rsvp', res, error);
      else
        sendData(res, {});
    });
  }
  else {
    var errors = [];
    if (!user)      errors.push('user is missing');
    if (!reply)     errors.push('reply is missing');
    if (!timestamp) errors.push('timestamp is missing');
    sendBadRequest(res, errors);
  }
};

/**
 * GET /api/participants/PEYMCJU8B5?timestamp=1364250830942
 * => { "tfernandez" : { "reply" : "yes", "timestamp" : "1364250832942" } }
 */
exports.getParticipants = function(req, res) {
  var group     = req.params.group;
  var timestamp = req.query['timestamp'];

  if (timestamp) {
    services.getParticipants(group, timestamp, function(error, result) {
      if (error)
        sendServerError('getParticipants', res, error);
      else
        sendData(res, result);
    });
  }
  else {
    var errors = [];
    if (!timestamp) errors.push('timestamp is missing');
    sendBadRequest(res, errors);
  }
};

/**
 * POST /api/comments/PEYMCJU8B5?timestamp=1364250830942
 * user=tfernandez&comment=saindo (application/x-www-form-urlencoded)
 */
exports.addComment = function(req, res) {
  var group     = req.params.group;
  var user      = req.body.user;
  var comment   = req.body.comment;
  var timestamp = req.query['timestamp'];

  if (user && comment && timestamp) {
    services.addComment(group, user, comment, timestamp, function(error, result) {
      if (error)
        sendServerError('addComment', res, error);
      else
        sendData(res, {});
    });
  }
  else {
    var errors = [];
    if (!user)      errors.push('user is missing');
    if (!comment)   errors.push('comment is missing');
    if (!timestamp) errors.push('timestamp is missing');
    sendBadRequest(res, errors);
  }
};

/**
 * GET /api/comments/PEYMCJU8B5?timestamp=1364250830942
 * => { "103723848" : { "user" : "tfernandez", "comment" : "saindo" } }
 */
exports.getComments = function(req, res) {
  var group     = req.params.group;
  var timestamp = req.query['timestamp'];

  if (timestamp) {
    services.getComments(group, timestamp, function(error, result) {
      if (error)
        sendServerError('getComments', res, error);
      else
        sendData(res, result);
    });
  }
  else {
    var errors = [];
    if (!timestamp) errors.push('timestamp is missing');
    sendBadRequest(res, errors);
  }
};

sendData = function(res, data) {
  res.status(200);
  res.type('application/json');
  res.send(data);
};

sendBadRequest = function(res, errors) {
  res.status(400);
  res.type('application/json');
  res.send({ errors : errors});
};

sendServerError = function(method, res, error) {
  console.log("[ERROR] api#" + method + ": " + error);
  res.status(500);
  res.send();
};
