var nepq = require('../build/'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

var n = nepq();

n.on('create', 'test', 'user', function(param) {
  return n.response(null, null);
});

n.on('read', 'test.t', 'user', function(param) {
  return n.response({
    user: 'user1',
    pwd: '1234',
    email: 'user1@test.com',
    age: 3,
    address: {
      country: 'TH',
      province: 'Bangkok'
    }
  }, null);
});

n.on('delete', 'a.b.c', 'user', function(param) {
  return n.response(null, 'error');
});

var p = n.bodyParser();

var cases = [
  {
    nepq: 'create test.user()',
    res: { ok: 1, error: null, result: null }
  },
  {
    nepq: 'read test.t.user() { pwd, age, address: { country } }',
    res: {
      ok: 1,
      error: null,
      result: { pwd: '1234', age: 3, address: { country: 'TH' } }
    }
  },
  {
    nepq: 'delete a.b.c.user() { }',
    res: { ok: 0, error: 'error', result: null }
  }
];

// test

cases.forEach(function(x) {
  n.process({body: n.parse(x.nepq)}, { writeHead: function(){}, end: function(r) {
    var k = JSON.parse(r);
    assert.deepEqual(x.res, k);
  } });
});
