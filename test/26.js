module.exports = {
  nepq: `read test { id, name("prefix") { first("10"), last() }, price(1, 6), obj({name: "test"}) }`,
  obj: {
    method: "read",
    name: "test",
    params: [],
    retrieves: {
      id: 1,
      name: {
        first: 1,
        'first.$': ['10'],
        last: 1,
        'last.$': []
      },
      'name.$': ["prefix"],
      price: 1,
      'price.$': [1, 6],
      obj: 1,
      'obj.$': [{name: "test"}]
    }
  },
  result: {
    id: 1111,
    name: function(args) {
      var prefix = args[0] + ' ';
      return {
        first: function(args) {
          return prefix + args[0] + 1;
        },
        last: prefix + 'last'
      };
    },
    price: function(args) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(args[0], args[1]);
    },
    obj: function(args, nq, cb) {
      cb(nq.method + ' ' + args[0].name);
    },
    shouldNotCalled: function() {
      throw new Error('should not called');
    }
  },
  response: {
    id: 1111,
    name: {
      first: "prefix 101",
      last: "prefix last"
    },
    price: [2, 3, 4, 5, 6],
    obj: "read test"
  }
};
