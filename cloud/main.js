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
  getGroup(request, response, function(group) {
    request.params.group = group.id; // replace group code by object id

    getRSVP(request, response, function(rsvp) {
      var params = request.params;
      rsvp.set({
        reply     : params.reply,
        timestamp : params.timestamp,
        timezone  : params.timezone
      });
      rsvp.save();
      response.success();
    });
  });
});

getGroup = function(request, response, callback) {
  var params = request.params;
  var code = params.group;

  new Parse.Query('Group')
    .equalTo('code', code)
    .first({
      success : function(group) {
        callback(group);
      },
      error : function(error) {
        response.error(error);
      }
    });
};

getRSVP = function(request, response, callback) {
  var params      = request.params;
  var timestamp   = params.timestamp;
  var timezone    = params.timezone;
  var group       = params.group;
  var date        = utils.getFormattedDate(timestamp, timezone);
  var participant = params.participant;

  new Parse.Query('RSVP')
    .equalTo('group', group)
    .equalTo('date', date)
    .equalTo('participant', participant)
    .first({
      success : function(rsvp) {
        if (!rsvp) {
          rsvp = new Parse.Object('RSVP');
          rsvp.set({
            group : group,
            date  : date,
            participant  : participant
          });
        }
        callback(rsvp);
      },
      error : function(error) {
        response.error(error);
      }
    });
};
