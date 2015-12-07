module.exports = {
  nepq: `read stock.product(price: 100, $limit: 10) { name }`,
  obj: {
    "method": "read",
    "namespace": [ "stock" ],
    "name": "product",
    "param": {
      "price": 100,
      "$limit": 10
    },
    "retrieve": {
      "name": 1
    }
  }
}

