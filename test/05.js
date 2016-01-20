module.exports = {
  nepq: `
read user(user: "user1") {
	id,
	name {
		first,
		last
	},
	user
}
  `,
  obj: {
    method: "read",
    name: "user",
    params: [{
      user: "user1"
    }],
    retrieves: {
      id: 1,
      name: {
        first: 1,
        last: 1
      },
      user: 1
    }
  },
  result: {
    id: 1111,
    name: {
      first: "first",
      last: "last",
      mid: "mid"
    },
    user: "user1",
    pwd: "1234",
    enabled: true
  },
  response: {
    id: 1111,
    name: {
      first: "first",
      last: "last"
    },
    user: "user1"
  }
};
