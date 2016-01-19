module.exports = {
  nepq: `read stock.product(price: 100, $limit: 10) { name }`,
  obj: {
    method: "read",
    name: "stock.product",
    params: {
      price: 100,
      $limit: 10
    },
    retrieves: {
      "name": 1
    }
  }
};
