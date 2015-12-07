module.exports = {
  nepq: `
delete user(user: "user1") {
	id,
	name,
	user
}
  `,
  obj: {
    "method": "delete",
    "namespace": null,
    "name": "user",
    "param": {
      "user": "user1"
    },
    "retrieve": {
      "id": 1,
      "name": 1,
      "user": 1
    }
  }
}
