module.exports = {
  nepq: `create user(username: "user1", password: "1234") { id }`,
  obj: {
    method: "create",
    namespace: null,
    name: "user",
    param: {
      username: "user1",
      password: "1234"
    },
    retrieve: {
      id: 1
    }
  }
}
