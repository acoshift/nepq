module.exports = {
  nepq: `create user(username: "user1", password: "1234") { }`,
  obj: {
    method: "create",
    name: "user",
    params: [{
      username: "user1",
      password: "1234"
    }],
    retrieves: 0,
    $_: 1
  },
  result: {
    token: "abcd",
    ok: 1
  },
  response: {}
};
