var express_storage = require('../lib/express-storage.js');

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal(express_storage.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};
