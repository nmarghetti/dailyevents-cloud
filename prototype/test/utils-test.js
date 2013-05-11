var utils  = require("../lib/utils"),
    assert = require("assert");

var now = new Date().getTime().toString();

describe('utils', function() {

  it('should generate unique identifiers', function() {
    var generatedIds = [];
    for (var i = 0; i < 1000; i++) {
      var id = utils.uniqueId();
      assert(id);
      assert(id.length >= 6);
      assert.equal(-1, generatedIds.indexOf(id));
      generatedIds.push(id);
    }
  });

  it('should format the current date', function() {
    var date = utils.getFormattedDate(now);
    assert(date);
    assert(date.length == 8);
  });

  it('should format the current time', function() {
    var time = utils.getFormattedTime(now);
    assert(time);
    assert(time.length == 9);
  });

});
