module.exports = {
  nepq: `read myweb.db.user(user: "test\\"text\\n\\u00a0\\\\") { }`,
  obj: {
    "method": "read",
    "namespace": [ "myweb", "db" ],
    "name": "user",
    "param": {
      "user": "test\"text\n\u00a0\\"
    },
    "retrieve": {}
  }
}
