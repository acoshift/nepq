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
    namespace: null,
    name: "user",
    param: {
      user: "user1"
    },
    retrieve: {
      id: 1,
      name: {
        first: 1,
        last: 1
      },
		  user: 1
    }
  }
}
