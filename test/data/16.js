module.exports = {
  nepq: `update stock.product({ id: 10 }, { $inc: { price: 40 } })`,
  obj: {
    "method": "update",
    "namespace": [
      "stock"
    ],
    "name": "product",
    "param": [
      { "id": 10 },
      { "$inc": { "price": 40 } }
    ],
    "retrieve": null
  }
}

