var services = require("../lib/services"),
    utils    = require("../lib/utils"),
    assert   = require("assert");

var group     = 'BR4ZUC4S',
    timestamp = '1364250830942',
    newGroup  = null;

describe('services', function() {

  it('should create a new group', function(done) {
    services.createGroup(function(error, reply) {
      assert(reply);
      newGroup = reply;
      done();
    });
  });

  it('should attend todays event', function(done) {
    services.rsvp(group, 'ewatanabe', 'yes', timestamp);
    services.rsvp(group, 'rfonseca', 'yes', timestamp, done);
  });

  it('should not attend todays event', function(done) {
    services.rsvp(group, 'tfernandez', 'no', timestamp);
    services.rsvp(group, 'gliguori', 'no', timestamp, done);
  });

  it('should change attendance status', function(done) {
    services.rsvp(group, 'rfonseca', 'no', timestamp);
    services.rsvp(group, 'gliguori', 'yes', timestamp);
    services.rsvp(group, 'tfernandez', 'yes', timestamp, done);
  });

  it('should get the confirmed participants', function(done) {
    services.getParticipants(group, timestamp, function(error, reply) {
      if (error) throw error;
      assert.equal(3, Object.keys(reply).length);
      assert.equal('yes', reply['tfernandez'].reply);
      assert.equal('yes', reply['ewatanabe'].reply);
      assert.equal('yes', reply['gliguori'].reply);
      done();
    })
  });

  it('should get empty participants list for non-existing event', function(done) {
    services.getParticipants("NON-EXISTING", timestamp, function(error, reply) {
      if (error) throw error;
      assert.equal(0, Object.keys(reply).length);
      done();
    })
  });

  it('should add comments to todays event', function(done) {
    services.addComment(newGroup, 'ewatanabe', 'bora?', '1364250831942');
    services.addComment(newGroup, 'tfernandez', 'saindo...', '1364250832942');
    services.addComment(newGroup, 'gliguori', 'cafe?', '1364250833942', done);
  });

  it('should get all comments from todays event', function(done) {
    services.getComments(newGroup, timestamp, function(error, reply) {
      if (error) throw error;
      assert.equal(3, Object.keys(reply).length);
      done();
    })
  });

  it('should get empty comments list for non-existing event', function(done) {
    services.getComments("NON-EXISTING", timestamp, function(error, reply) {
      if (error) throw error;
      assert.equal(0, Object.keys(reply).length);
      done();
    })
  });

});
