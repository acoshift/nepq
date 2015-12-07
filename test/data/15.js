module.exports = {
  nepq: `read stock.product(10, "p0", { "$w": 1 }) { price }`,
  obj: {
    "method": "read",
    "namespace": [
      "stock"
    ],
    "name": "product",
    "param": [
      10,
      "p0",
      {
        "$w": 1
      }
    ],
    "retrieve": {
      "price": 1
    }
  }
}

