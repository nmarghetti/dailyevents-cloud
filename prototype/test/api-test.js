var api    = require("../lib/api"),
    assert = require("assert");

var group = null;

describe('api', function() {

  it('should render the index page', function(done) {
    api.index({}, {
      render : function(name, json) {
        assert.equal('index', name);
        done();
      }
    });
  });

  it('should create a new group', function(done) {
    api.createGroup({}, {
      send : function(json) {
        group = json['id'];
        assert(group);
        done();
      },
      status : function(code) {
        assert.equal(200, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should accept rsvp when all parameters are provided', function(done) {
    api.rsvp({
      params : {
        group : group
      },
      body : {
        reply : 'yes',
        user : 'tfernandez'
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        done();
      },
      status : function(code) {
        assert.equal(200, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should reject rsvp when the user is missing', function(done) {
    api.rsvp({
      params : {
        group : group
      },
      body : {
        user : '',
        reply : 'yes'
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('user is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should reject rsvp when the reply is missing', function(done) {
    api.rsvp({
      params : {
        group : group
      },
      body : {
        user : 'tfernandez',
        reply : ''
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('reply is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should reject rsvp when the timestamp is missing', function(done) {
    api.rsvp({
      params : {
        group : group
      },
      body : {
        user : 'tfernandez',
        reply : 'yes'
      },
      query : {
        timestamp : ''
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('timestamp is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should get the participants for a given group at todays event', function(done) {
    api.getParticipants({
      params : {
        group : group
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        assert.equal(1, Object.keys(json).length);
        done();
      },
      status : function(code) {
        assert.equal(200, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should not get any participant when the timestamp is missing', function(done) {
    api.getParticipants({
      params : {
        group : group
      },
      query : {
        timestamp : ''
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('timestamp is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should add a comment when all parameters are provided', function(done) {
    api.addComment({
      params : {
        group : group
      },
      body : {
        user : 'ewatanabe',
        comment : 'bora?'
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        done();
      },
      status : function(code) {
        assert.equal(200, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should add a second comment by the same person', function(done) {
    api.addComment({
      params : {
        group : group
      },
      body : {
        user : 'ewatanabe',
        comment : 'saindo...'
      },
      query : {
        timestamp : '1364250831942'
      }
    }, {
      send : function(json) {
        done();
      },
      status : function(code) {
        assert.equal(200, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should not add a comment when the user is missing', function(done) {
    api.addComment({
      params : {
        group : group
      },
      body : {
        user : '',
        comment : 'bora?'
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('user is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should not add a blank comment', function(done) {
    api.addComment({
      params : {
        group : group
      },
      body : {
        user : 'ewatanabe',
        comment : ''
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('comment is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should not add a comment when the timestamp is missing', function(done) {
    api.addComment({
      params : {
        group : group
      },
      body : {
        user : 'ewatanabe',
        comment : 'bora?'
      },
      query : {
        timestamp : ''
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('timestamp is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should get all comments for a given group at todays event', function(done) {
    api.getComments({
      params : {
        group : group
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        var keys = Object.keys(json);
        assert.equal(2, keys.length);
        done();
      },
      status : function(code) {
        assert.equal(200, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should not get any comment when the timestamp is missing', function(done) {
    api.getComments({
      params : {
        group : group,
      },
      query : {
        timestamp : ''
      }
    }, {
      send : function(json) {
        assert(json['errors'].indexOf('timestamp is missing') != -1);
        done();
      },
      status : function(code) {
        assert.equal(400, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

  it('should get participants and comments for a given group at todays event', function(done) {
    api.getGroup({
      params : {
        group : group,
      },
      query : {
        timestamp : '1364250830942'
      }
    }, {
      send : function(json) {
        assert.equal(1, Object.keys(json.participants).length);
        assert.equal(2, Object.keys(json.comments).length);
        done();
      },
      status : function(code) {
        assert.equal(200, code);
      },
      type : function(mime) {
        assert.equal('application/json', mime);
      }
    });
  });

});
