module.exports = {
  nepq: `read myweb.db.user(user: "test\\"text\\n\\u00a0\\\\") { }`,
  obj: {
    method: "read",
    name: "myweb.db.user",
    params: [{
      user: "test\"text\n\u00a0\\"
    }],
    retrieves: 0,
    $_: 1
  }
};
