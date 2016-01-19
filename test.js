var nepq = require('./build/nepq').parser,
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

fs.readdirSync(path.join(__dirname, 'test'))
  .filter(function(x) { return x.substr(-3) === '.js'; })
  .map(function(x) { return x.substr(0, x.length - 3); })
  .forEach(function(x) {
    it(x, function(cb) {
      var t = require('./test/' + x);
      var n = nepq.parse(t.nepq);
      var o = t.obj;
      assert.deepEqual(n, o);
      cb();
    });
  });
