module.exports = {
  nepq: `create user(username: "user1", password: "1234") { id }`,
  obj: {
    method: "create",
    name: "user",
    params: {
      username: "user1",
      password: "1234"
    },
    retrieves: {
      id: 1
    }
  }
};
