var nepq = require('../build/'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

var n = nepq();

n.on('create', 'test', 'user', function(q) {
  n.response(null, null);
});

n.on('read', 'test.t', 'user', function(q) {
  n.response({
    user: 'user1',
    pwd: '1234',
    email: 'user1@test.com',
    age: 0,
    value: function() { return 134; },
    address: {
      country: function() { return 'TH'; },
      province: 'Bangkok'
    }
  }, null);
});

n.on('delete', 'a.b.c', 'user', function(q) {
  n.response(null, 'error');
});

var p = n.bodyParser();

var cases = [
  {
    nepq: 'create test.user()',
    res: { ok: 1 }
  },
  {
    nepq: 'read test.t.user() { pwd, age, address: { country }, value }',
    res: {
      ok: 1,
      result: { pwd: '1234', age: 0, address: { country: 'TH' }, value: 134 }
    }
  },
  {
    nepq: 'delete a.b.c.user() { }',
    res: { ok: 0, error: 'error' }
  }
];

// test

n.res = { writeHead: function(){}, end: function(r) {
  var k = JSON.parse(r);
  assert.deepEqual(n.__json, k);
}};

cases.forEach(function(x) {
  n.__json = x.res;
  n.parse(x.nepq);
});
