var utils = require('cloud/utils');

var define = Parse.Cloud.define;

define('createGroup', function(request, response) {
  var group = new Parse.Object('Group');
  group.set('code', utils.uniqueId());
  group.save();
  response.success({
    code : group.get('code')
  });
});

define('rsvp', function(request, response) {
  findGroup(request, response, function(group) {
    var params = request.params;
    params.group = group.id;
    findRSVP(request, response, function(rsvp) {
      rsvp.set({
        group       : params.group,
        date        : params.date,
        participant : params.participant,
        reply       : params.reply,
        timestamp   : params.timestamp,
        timezone    : params.timezone
      });
      rsvp.save();
      response.success();
    });
  });
});

define('addComment', function(request, response) {
  findGroup(request, response, function(group) {
    var params  = request.params;
    var comment = new Parse.Object('Comment');
    comment.set({
      group       : group.id,
      date        : utils.dateString(params.timestamp, params.timezone),
      participant : params.participant,
      comment     : params.comment,
      timestamp   : params.timestamp,
      timezone    : params.timezone
    });
    comment.save();
    response.success();
  });
});

findGroup = function(request, response, callback) {
  new Parse.Query('Group')
    .equalTo('code', request.params.group)
    .first({
      success : function(group) {
        callback(group);
      },
      error : function(error) {
        response.error(error);
      }
    });
};

findRSVP = function(request, response, callback) {
  var params  = request.params;
  params.date = utils.dateString(params.timestamp, params.timezone);
  new Parse.Query('RSVP')
    .equalTo('group', params.group)
    .equalTo('date', params.date)
    .equalTo('participant', params.participant)
    .first({
      success : function(rsvp) {
        rsvp = rsvp || new Parse.Object('RSVP');
        callback(rsvp);
      },
      error : function(error) {
        response.error(error);
      }
    });
};
