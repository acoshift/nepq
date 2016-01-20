module.exports = {
  nepq: `create test.product(name: "p1", price: 100) { }`,
  obj: {
    method: "create",
    name: "test.product",
    params: [{
      name: "p1",
      price: 100
    }],
    retrieves: 0
  }
};
