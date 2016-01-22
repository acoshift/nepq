module.exports = {
  nepq: `read user(user: "user1") { id, name, user }`,
  obj: {
    method: "read",
    name: "user",
    params: [{
      user: "user1"
    }],
    retrieves: {
      id: 1,
      name: 1,
      user: 1
    },
    $_: 1
  },
  result: {
    id: 1111,
    name: "my user name",
    user: "user1",
    pwd: "1234",
    age: 1
  },
  response: {
    id: 1111,
    name: "my user name",
    user: "user1"
  }
};
