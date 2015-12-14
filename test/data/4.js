module.exports = {
  nepq: `read user({"user": "user1"}) { id, name, user }`,
  obj: {
    method: "read",
    name: "user",
    params: {
      user: "user1"
    },
    retrieves: {
      id: 1,
      name: 1,
		  user: 1
    }
  }
};
