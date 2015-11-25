'use strict';

var nepq = require('../build/'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

var tests = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09'
];

for (var i in tests) {
  var n = nepq.parse(fs.readFileSync(path.join(__dirname, tests[i] + '.nepq')).toString());
  var j = JSON.parse(fs.readFileSync(path.join(__dirname, tests[i] + '.json')).toString());
  assert.deepEqual(n, j);
}
