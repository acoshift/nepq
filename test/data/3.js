module.exports = {
  nepq: `read user(user: "user1") { id, name, user }`,
  obj: {
    method: "read",
    namespace: [],
    name: "user",
    param: {
      user: "user1"
    },
    retrieve: {
      id: 1,
      name: 1,
      user: 1
    }
  }
}