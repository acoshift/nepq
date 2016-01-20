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
  },
  result: [
    { name: "0001", price: 100 },
    { name: "0002", price: 100 },
    { name: "0003", price: 100 },
    { name: "0004", price: 100 },
    { name: "0005", price: 100 },
    { name: "0006", price: 100 },
    { name: "0007", price: 100 },
    { name: "0008", price: 100 },
    { name: "0009", price: 100 },
    { name: "0010", price: 100 }
  ],
  response: [
    { name: "0001" },
    { name: "0002" },
    { name: "0003" },
    { name: "0004" },
    { name: "0005" },
    { name: "0006" },
    { name: "0007" },
    { name: "0008" },
    { name: "0009" },
    { name: "0010" }
  ]
};
