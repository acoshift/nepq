module.exports = {
  nepq: `read test -{ name, contact { tel } }`,
  obj: {
    method: "read",
    name: "test",
    params: {},
    retrieves: {
      name: 0,
      contact: {
        tel: 0
      }
    }
  }
};
