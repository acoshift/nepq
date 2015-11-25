'use strict';

var nepq = require('../build/'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

process.chdir(path.join(__dirname, 'data'));

fs.readdirSync('.')
  .filter(function(x) { return x.substr(-5) === '.nepq'; })
  .map(function(x) { return x.substr(0, x.length - 5); })
  .forEach(function(x) {
    var n = nepq.parse(fs.readFileSync(x + '.nepq').toString());
    var j = JSON.parse(fs.readFileSync(x + '.json').toString());
    assert.deepEqual(n, j);
  });
