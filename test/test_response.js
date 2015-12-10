var nepq = require('../build/'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

var n = nepq();

n.on('create', 'test', 'user', function(q) {
  n.send();
});

n.on('read', 'test.t', 'user', function(q) {
  n.send({
    user: 'user1',
    pwd: '1234',
    email: 'user1@test.com',
    age: 0,
    value: function() { return 134; },
    address: {
      country: function() { return 'TH'; },
      province: 'Bangkok'
    }
  });
});

n.on('delete', 'a.b.c', 'user', function(q) {
  n.status(500).send({});
});

n.on('read', '', 'array', function(q) {
  n.send([
    { id: 0, name: 'p0', b: false },
    { id: 1, name: 'p1', b: true },
    { id: 2, name: 'p2', b: null, k: 10 }
  ]);
});

n.on('read', '', 'func_callback', function(q) {
  n.send({
    test1: function(q) { return 'result from return'; },
    test2: function(q, cb) { cb('result from callback'); }
  })
});

n.on('read', '', 'func_callback2', function(q) {
  n.send({
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

n.on('read', '', 'p', function(q) {
  n.send([
    { name: "p0", sub: [ { name: "p0s0" }, { name: "p0s1" }, { name: "p0s2" } ] },
    { name: "p1", sub: [ { name: "p1s0" }, { name: "p1s1" } ] },
    { name: "p2", sub: [ "p2s0", "p2s1", "p2s2" ] }
  ]);
});

n.on('read', '', 'test_retrieve_sub_field_from_value', function(q) {
  n.send({
    name: "test"
  });
});

n.on('read', '', 'test_result_is_nested_array', function(q) {
  n.send([
    { id: [ { a: 10, b: 12 }, { a: 5 } ] }
  ]);
});

var p = n.bodyParser();

var cases = [
  {
    nepq: 'create test.user()',
    res: null,
    status: 200
  },
  {
    nepq: 'read test.t.user() { pwd, age, address { country }, value }',
    res: { pwd: '1234', age: 0, address: { country: 'TH' }, value: 134 },
    status: 200
  },
  {
    nepq: 'delete a.b.c.user() { }',
    res: {},
    status: 500
  },
  {
    nepq: 'read array() { id, name }',
    res: [
      { id: 0, name: 'p0' },
      { id: 1, name: 'p1' },
      { id: 2, name: 'p2' }
    ],
    status: 200
  },
  {
    nepq: 'read func_callback() { test1, test2 }',
    res: {
      test1: 'result from return',
      test2: 'result from callback'
    },
    status: 200
  },
  {
    nepq: 'read func_callback2() { test1, test2 { a } }',
    res: {
      test1: { a: 'a', b: 'b' },
      test2: { a: 'a' }
    },
    status: 200
  },
  {
    nepq: 'read p { sub { name } }',
    res: [
      { sub: [ { name: "p0s0" }, { name: "p0s1" }, { name: "p0s2" } ] },
      { sub: [ { name: "p1s0" }, { name: "p1s1" } ] }
    ],
    status: 200
  },
  {
    nepq: 'read test_retrieve_sub_field_from_value { name { id } }',
    res: {},
    status: 200
  },
  {
    nepq: 'read test_result_is_nested_array { id }',
    res: [
      { id: [ { a: 10, b: 12 }, { a: 5 } ] }
    ],
    status: 200
  }
];

cases.forEach(function(x, i) {
  it('response ' + i, function(cb) {
    n.res = {
      writeHead: function(status) {
        assert.equal(status, x.status);
      },
      end: function(r) {
        var k = JSON.parse(r);
        assert.deepEqual(x.res, k);
        cb();
      }
    };
    n.parse(x.nepq);
  });
});
