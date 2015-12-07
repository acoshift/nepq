module.exports = {
  nepq: `delete db.user(user: "user1") { }`,
  obj: {
    "method": "delete",
    "namespace": [ "db" ],
    "name": "user",
    "param": {
      "user": "user1"
    },
    "retrieve": {}
  }
}
