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

n.on('read', '', 'array', function(q) {
  n.response([
    { id: 0, name: 'p0', b: false },
    { id: 1, name: 'p1', b: true },
    { id: 2, name: 'p2', b: null, k: 10 }
  ]);
});

n.on('read', '', 'func_callback', function(q) {
  n.response({
    test1: function(q) { return 'result from return'; },
    test2: function(q, cb) { cb('result from callback'); }
  })
});

n.on('read', '', 'func_callback2', function(q) {
  n.response({
    test1: function(q) {
      return {
        a: function(q) { return 'a'; },
        b: function(q) { return 'b'; }
      };
    },
    test2: function(q, cb) {
      cb({
        a: function(q, cb) { cb('a'); },
        b: function(q, cb) { cb('b'); }
      });
    }
  })
});

var p = n.bodyParser();

var cases = [
  {
    nepq: 'create test.user()',
    res: { ok: 1 }
  },
  {
    nepq: 'read test.t.user() { pwd, age, address { country }, value }',
    res: {
      ok: 1,
      result: { pwd: '1234', age: 0, address: { country: 'TH' }, value: 134 }
    }
  },
  {
    nepq: 'delete a.b.c.user() { }',
    res: { ok: 0, error: 'error' }
  },
  {
    nepq: 'read array() { id, name }',
    res: {
      ok: 1,
      result: [
        { id: 0, name: 'p0' },
        { id: 1, name: 'p1' },
        { id: 2, name: 'p2' }
      ]
    }
  },
  {
    nepq: 'read func_callback() { test1, test2 }',
    res: {
      ok: 1,
      result: {
        test1: 'result from return',
        test2: 'result from callback'
      }
    }
  },
  {
    nepq: 'read func_callback2() { test1, test2 { a } }',
    res: {
      ok: 1,
      result: {
        test1: { a: 'a', b: 'b' },
        test2: { a: 'a' }
      }
    }
  }
];

cases.forEach(function(x, i) {
  it('response ' + i, function(cb) {
    n.__json = x.res;
    n.res = { writeHead: function(){}, end: function(r) {
      var k = JSON.parse(r);
      assert.deepEqual(n.__json, k);
      cb();
    }};
    n.parse(x.nepq);
  });
});
