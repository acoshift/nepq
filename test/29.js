module.exports = {
  nepq: `calc sum(...[10, 20, 30, 40]) *{ result(0) }`,
  obj: {
    method: 'calc',
    name: 'sum',
    params: [10, 20, 30, 40],
    retrieves: {
      'result.$': [0]
    },
    $_: null
  },
  result: {
    ok: 1,
    result: function (args, nq) {
      var init = args[0]
      return nq.params.reduce(function (p, c) { return p + c }, init)
    }
  },
  response: {
    ok: 1,
    result: 100
  }
}
