module.exports = {
  nepq: `update stock.product({ id: 10 }, { $inc: { price: 40 } })`,
  obj: {
    method: "update",
    name: "stock.product",
    params: [
      { id: 10 },
      { $inc: { price: 40 } }
    ],
    retrieves: 1,
    $_: 1
  }
};
