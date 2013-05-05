var    _  = require('underscore'),
    utils = require('cloud/utils');

var define = Parse.Cloud.define;

define('createGroup', function(request, response) {
  new Parse.Object('Group').save({
      code : utils.uniqueId()
    }, {
    success: function(group) {
      response.success({ code : group.get('code') });
    },
    error: function(group, error) {
      response.error(error);
    }
  });
});

define('setStatus', function(request, response) {
  findGroup(request, response, function(group) {
    findStatus(request, response, function(status) {
      var params = requestParams(request);
      status.save({
          group       : params.group,
          date        : params.date,
          participant : params.participant,
          reply       : params.reply,
          timestamp   : params.timestamp,
          timezone    : params.timezone
        }, {
        success: function(status) {
          response.success();
        },
        error: function(status, error) {
          response.error(error);
        }
      });
    });
  });
});

define('addComment', function(request, response) {
  findGroup(request, response, function(group) {
    var params  = requestParams(request);
    new Parse.Object('Comment').save({
        group       : params.group,
        date        : params.date,
        participant : params.participant,
        comment     : params.comment,
        timestamp   : params.timestamp,
        timezone    : params.timezone
      }, {
      success: function(comment) {
        response.success();
      },
      error: function(comment, error) {
        response.error(error);
      }
    });
  });
});

define('getDetails', function(request, response) {
  findGroup(request, response, function(group) {
    var details = {};
    listStatuses(request, response, function(statuses) {
      details.statuses = [];
      _.each(statuses, function(status) {
        if (status.get('reply') == 'yes')
          details.statuses.push({
            participant : status.get('participant'),
            timestamp   : status.get('timestamp'),
            timezone    : status.get('timezone')
          });
      });
      listComments(request, response, function(comments) {
        details.comments = [];
        _.each(comments, function(comment) {
          details.comments.push({
            participant : comment.get('participant'),
            comment     : comment.get('comment'),
            timestamp   : comment.get('timestamp'),
            timezone    : comment.get('timezone')
          });
        });
        response.success(details);
      });
    });
  });
});

findGroup = function(request, response, callback) {
  new Parse.Query('Group')
    .equalTo('code', request.params.group)
    .first({
      success : function(group) {
        if (group) {
          request.params.group = group.id;
          callback(group);
        }
        else {
          response.error('group not found: ' + request.params.group);
        }
      },
      error : function(error) {
        response.error(error);
      }
    });
};

findStatus = function(request, response, callback) {
  var params = requestParams(request);
  new Parse.Query('Status')
    .equalTo('group', params.group)
    .equalTo('date', params.date)
    .equalTo('participant', params.participant)
    .first({
      success : function(status) {
        status = status || new Parse.Object('Status');
        callback(status);
      },
      error : function(error) {
        response.error(error);
      }
    });
};

listStatuses = function(request, response, callback) {
  var params = requestParams(request);
  new Parse.Query('Status')
    .equalTo('group', params.group)
    .equalTo('date', params.date)
    .find({
      success : function(statuses) {
        callback(statuses);
      },
      error : function(error) {
        response.error(error);
      }
    });
};

listComments = function(request, response, callback) {
  var params = requestParams(request);
  new Parse.Query('Comment')
    .equalTo('group', params.group)
    .equalTo('date', params.date)
    .find({
      success : function(comments) {
        callback(comments);
      },
      error : function(error) {
        response.error(error);
      }
    });
};

requestParams = function(request) {
  var params  = request.params;
  params.date = utils.dateString(params.timestamp, params.timezone);
  return params;
};
