var config = require('./config'),
    utils = require('./utils');

var redis = config.redisClient;

exports.createGroup = function(callback) {
  var group = utils.uniqueId();
  callback(null, group);
};

/**
 * > hmset participants:BR4ZUC4S:20130313 tfernandez "{ 'reply' : 'yes', 'timestamp' : '1364250831942' }"
 * "OK"
 */
exports.rsvp = function(group, user, reply, timestamp, callback) {
  var key = getParticipantsKey(group, timestamp);
  var value = { reply : reply, timestamp : timestamp };
  redis.hmset(key, user, JSON.stringify(value), callback);
  setExpiration(key);
};

/**
 * > hgetall participants:BR4ZUC4S:20130313
 * { "tfernandez" : { "reply" : "yes", "timestamp" : "1364250832942" }, "ewatanabe" : { "reply" : "no", "timestamp" : "1364250833942" } }
 */
exports.getParticipants = function(group, timestamp, callback) {
  var key = getParticipantsKey(group, timestamp);
  redis.hgetall(key, function(error, reply) {
    reply = !reply ? {} : reply;
    for (var user in reply) {
      var rsvp = JSON.parse(reply[user]);
      if (rsvp.reply == 'yes')
        reply[user] = rsvp;
      else
        delete reply[user];
    }
    callback(error, reply);
  });
};

/**
 * > hmset comments:BR4ZUC4S:20130313 1364250831942 "{ 'user' : 'gliguori', 'comment' : 'cafe?' }"
 * "OK"
 */
exports.addComment = function(group, user, comment, timestamp, callback) {
  var key = getCommentsKey(group, timestamp);
  var value = { user : user, comment : comment };
  redis.hmset(key, timestamp, JSON.stringify(value), callback);
  setExpiration(key);
};

/**
 * > hgetall comments:BR4ZUC4S:20130313
 * { "1364250832942" : { "user" : "ewatanabe", "comment" : "bora?" }, "1364250833942" : { "user" : "tfernandez", "comment" : "saindo..." } }
 */
exports.getComments = function(group, timestamp, callback) {
  var key = getCommentsKey(group, timestamp);
  redis.hgetall(key, function(error, reply) {
    reply = !reply ? {} : reply;
    for (var timestamp in reply) {
      var comment = JSON.parse(reply[timestamp]);
      reply[timestamp] = comment;
    }
    callback(error, reply);
  });
}

/**
 * > expire participants:BR4ZUC4S:20130313 86400
 * true
 */
setExpiration = function(key) {
  redis.expire(key, 86400); // 1 day
};

getParticipantsKey = function(group, timestamp) {
  return getKey("participants", group, timestamp);
}

getCommentsKey = function(group, timestamp) {
  return getKey("comments", group, timestamp);
}

getKey = function(namespace, group, timestamp) {
  return namespace + ":" + group + ":" + utils.getFormattedDate(timestamp);
};
