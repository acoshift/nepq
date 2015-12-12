var nepq = require('../build/'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert');

var n = nepq();

n.on('create', 'test', 'user', function(q, t) {
  t(q.response());
});

n.on('read', 'test.t', 'user', function(q, t) {
  t(q.response({
    user: 'user1',
    pwd: '1234',
    email: 'user1@test.com',
    age: 0,
    value: function() { return 134; },
    address: {
      country: function() { return 'TH'; },
      province: 'Bangkok'
    }
  }));
});

n.on('delete', 'a.b.c', 'user', function(q, t) {
  t(q.response({}));
});

n.on('read', '', 'array', function(q, t) {
  t(q.response([
    { id: 0, name: 'p0', b: false },
    { id: 1, name: 'p1', b: true },
    { id: 2, name: 'p2', b: null, k: 10 }
  ]));
});

n.on('read', '', 'func_callback', function(q, t) {
  t(q.response({
    test1: function(q) { return 'result from return'; },
    test2: function(q, cb) { cb('result from callback'); }
  }));
});

n.on('read', '', 'func_callback2', function(q, t) {
  t(q.response({
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
  }));
});

n.on('read', '', 'p', function(q, t) {
  t(q.response([
    { name: "p0", sub: [ { name: "p0s0" }, { name: "p0s1" }, { name: "p0s2" } ] },
    { name: "p1", sub: [ { name: "p1s0" }, { name: "p1s1" } ] },
    { name: "p2", sub: [ "p2s0", "p2s1", "p2s2" ] }
  ]));
});

n.on('read', '', 'test_retrieve_sub_field_from_value', function(q, t) {
  t(q.response({
    name: "test"
  }));
});

n.on('read', '', 'test_result_is_nested_array', function(q, t) {
  t(q.response([
    { id: [ { a: 10, b: 12 }, { a: 5 } ] }
  ]));
});

var p = n.bodyParser();

var cases = [
  {
    nepq: 'create test.user()',
    res: null
  },
  {
    nepq: 'read test.t.user() { pwd, age, address { country }, value }',
    res: { pwd: '1234', age: 0, address: { country: 'TH' }, value: 134 },
  },
  {
    nepq: 'delete a.b.c.user() { }',
    res: {}
  },
  {
    nepq: 'read array() { id, name }',
    res: [
      { id: 0, name: 'p0' },
      { id: 1, name: 'p1' },
      { id: 2, name: 'p2' }
    ]
  },
  {
    nepq: 'read func_callback() { test1, test2 }',
    res: {
      test1: 'result from return',
      test2: 'result from callback'
    }
  },
  {
    nepq: 'read func_callback2() { test1, test2 { a } }',
    res: {
      test1: { a: 'a', b: 'b' },
      test2: { a: 'a' }
    }
  },
  {
    nepq: 'read p { sub { name } }',
    res: [
      { sub: [ { name: "p0s0" }, { name: "p0s1" }, { name: "p0s2" } ] },
      { sub: [ { name: "p1s0" }, { name: "p1s1" } ] }
    ]
  },
  {
    nepq: 'read test_retrieve_sub_field_from_value { name { id } }',
    res: {}
  },
  {
    nepq: 'read test_result_is_nested_array { id }',
    res: [
      { id: [ { a: 10, b: 12 }, { a: 5 } ] }
    ]
  }
];

cases.forEach(function(x, i) {
  it('response ' + i, function(cb) {
    n.parse(x.nepq, function(r) {
      assert.deepEqual(x.res, r);
      cb();
    });
  });
});
