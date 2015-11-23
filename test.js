var nepq = require("./nepq").parser;
var fs = require("fs");
var path = require("path");
var assert = require('assert');


var testDir = './test';

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

var err = false;

for (var i in tests) {
  var n = nepq.parse(fs.readFileSync(path.join(testDir, tests[i] + '.nepq')).toString());
  var j = JSON.parse(fs.readFileSync(path.join(testDir, tests[i] + '.json')).toString());
  try {
    assert.deepEqual(n, j, 'parse ' + tests[i] + '.nepq not equal to ' + tests[i] + '.json' );
    console.log('Test ' + tests[i] + ': OK');
  } catch(e) {
    console.log('Test ' + tests[i] + ': Failed');
    err = true;
  }
}

process.exit(err ? 1 : 0);
