module.exports = {
  nepq: `delete myweb.db.user(user: "user1") { }`,
  obj: {
    "method": "delete",
    "namespace": [ "myweb", "db" ],
    "name": "user",
    "param": {
      "user": "user1"
    },
    "retrieve": {}
  }
}
