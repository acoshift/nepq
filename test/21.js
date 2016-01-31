module.exports = {
  nepq: `query test.db.users(a: 10e+1, b: 0.5e5){_id,name,role,enabled}`,
  obj: {
    method: 'query',
    name: 'test.db.users',
    params: [{
      a: 10e+1,
      b: 0.5e5
    }],
    retrieves: {
      _id: 1,
      name: 1,
      role: 1,
      enabled: 1
    },
    $_: 1
  }
}
