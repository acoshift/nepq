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
  },
  result: {
    id: 12345,
    name: "test",
    contact: {
      address: "123/456",
      tel: "012-345-6789",
      country: "TH"
    },
    enabled: true
  },
  response: {
    id: 12345,
    contact: {
      address: "123/456",
      country: "TH"
    },
    enabled: true
  }
};
