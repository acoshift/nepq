module.exports = {
  nepq: `read stock.product(10, "p0", { "$w": 1 }) { price }`,
  obj: {
    method: 'read',
    name: 'stock.product',
    params: [
      10,
      'p0',
      {
        $w: 1
      }
    ],
    retrieves: {
      price: 1
    },
    $_: 1
  }
}
