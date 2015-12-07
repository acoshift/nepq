module.exports = {
  nepq: `create test.product(name: "p1", price: 100) { }`,
  obj: {
    "method": "create",
    "namespace": [ "test" ],
    "name": "product",
    "param": {
      "name": "p1",
      "price": 100
    },
    "retrieve": {}
  }
}
