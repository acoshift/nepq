module.exports = {
  nepq: `{ id, obj(2) -{ name(1, 2) +{ first }, tel }, result *{ res(id: 0), obj +{ ok } } }`,
  obj: {
    method: "",
    name: "",
    params: [],
    retrieves: {
      id: 1,
      obj: {
        name: {
          first: 1
        },
        'name.$': [1, 2],
        'name.$_': 1,
        tel: 1
      },
      'obj.$': [2],
      'obj.$_': 0,
      result: {
        'res.$': [{
          id: 0
        }],
        obj: {
          ok: 1
        },
        'obj.$_': 1,
      },
      'result.$_': null,
    },
    $_: 1
  },
  result: {
    id: function() { return "1234"; },
    obj: function(args) {
      var p = args[0];
      return {
        name: function(args) {
          var k = p + args[0] + args[1];
          return {
            first: k + "first",
            last: k + "last"
          };
        },
        tel: "+xx-23-456-789",
        ok: 1
      };
    },
    result: {
      res: function(args) {
        return args[0].id * 10;
      },
      obj: {
        ok: 1,
        no: 0
      }
    }
  },
  response: {
    id: "1234",
    obj: {
      name: {
        first: "5first"
      },
      ok: 1
    },
    result: {
      res: 0,
      obj: {
        ok: 1
      }
    }
  }
};
