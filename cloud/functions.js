var     _ = require('underscore'),
    utils = require('cloud/utils');

var define = Parse.Cloud.define;

define('register', function(request, response) {
  new Parse.Object('Client').save({
      environment : request.params.environment
    }, {
    success: function(client) {
      response.success({ id : client.id });
    },
    error: function(client, error) {
      response.error(error);
    }
  });
});

define('createGroup', function(request, response) {
  new Parse.Object('Group').save({
      code : utils.uniqueId(),
      name : request.params.name
    }, {
    success: function(group) {
      response.success({ id : group.id });
    },
    error: function(group, error) {
      response.error(error);
    }
  });
});

define('getGroupById', function(request, response) {
  new Parse.Query('Group')
    .get(request.params.id, {
      success : function(group) {
        if (group)
          response.success({
            code : group.get('code'),
            name : group.get('name')
          });
        else
          response.success({});
      },
      error : function(group, error) {
        response.error(error);
      }
    });
});

define('getGroupByCode', function(request, response) {
  var code = request.params.code || '';
  new Parse.Query('Group')
    .equalTo('code', code.toUpperCase())
    .find({
      success : function(groups) {
        if (groups.length == 1)
          response.success({
            id   : groups[0].id,
            name : groups[0].get('name')
          });
        else
          response.success({});
      },
      error : function(error) {
        response.error(error);
      }
    });
});

define('setStatus', function(request, response) {
  fetchStatus(request, response, function(status) {
    var params = resolveParams(request);
    var dataToSave = {
      groupId     : params.groupId,
      date        : params.date,
      participant : params.participant,
      reply       : params.reply,
      timestamp   : params.timestamp,
      timezone    : params.timezone
    };
    if (params.clientId) {
      dataToSave.clientId = params.clientId;
    }
    status.save(dataToSave, {
      success: function(status) {
        response.success();
      },
      error: function(status, error) {
        response.error(error);
      }
    });
  });
});

define('addComment', function(request, response) {
  var params  = resolveParams(request);
  new Parse.Object('Comment').save({
      clientId    : params.clientId,
      groupId     : params.groupId,
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

define('getEvent', function(request, response) {
  var details = {};
  listStatuses(request, response, function(statuses) {
    details.statuses = [];
    _.each(statuses, function(status) {
      details.statuses.push({
        participant : status.get('participant'),
        reply       : status.get('reply'),
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

fetchStatus = function(request, response, callback) {
  var params = resolveParams(request);
  var query = new Parse.Query('Status');
  query = params.clientId ? query.equalTo('clientId', params.clientId)
                          : query.equalTo('participant', params.participant);
  query
    .equalTo('groupId', params.groupId)
    .equalTo('date', params.date)
    .find({
      success : function(statuses) {
        if (statuses.length == 1)
          callback(statuses[0]);
        else
          callback(new Parse.Object('Status'));
      },
      error : function(error) {
        response.error(error);
      }
    });
};

listStatuses = function(request, response, callback) {
  var params = resolveParams(request);
  new Parse.Query('Status')
    .equalTo('groupId', params.groupId)
    .equalTo('date', params.date)
    .ascending('updatedAt')
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
  var params = resolveParams(request);
  new Parse.Query('Comment')
    .equalTo('groupId', params.groupId)
    .equalTo('date', params.date)
    .ascending('createdAt')
    .find({
      success : function(comments) {
        callback(comments);
      },
      error : function(error) {
        response.error(error);
      }
    });
};

resolveParams = function(request) {
  var params  = request.params;
  params.date = utils.dateString(params.timestamp, params.timezone);
  return params;
};
