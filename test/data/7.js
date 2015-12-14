module.exports = {
  nepq: `
delete user(user: "user1") {
	id,
	name,
	user
}
  `,
  obj: {
    method: "delete",
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
