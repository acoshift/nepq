var nepq = require('../build/')

var n = 80000

test('read', n)
test('read user', n)
test('read user(id: 10)', n)
test('read user(id: 10) { }', n)
test('read user(id: 10) { id, name, email }', n)
test('read user(id: 10) { id, name, contact { address, tel, country } }', n)
test('read user({id: 10, name: "test", age: 1})', n)
test('read user({id: 10, name: "test", age: 1}) { id, name, contact { address, tel, country } }', n)
test('{ id, name, address }', n)

function test (example, n) {
  console.log(example)
  var start = Date.now()
  caseNq(example, n)
  var end = Date.now()
  var ts = end - start
  console.log(Math.floor(n / ts * 1000) + ' case/sec (nepq)')

  start = Date.now()
  caseNqFastParse(example, n)
  end = Date.now()
  ts = end - start
  console.log(Math.floor(n / ts * 1000) + ' case/sec (nepq fastParse)')

  /*start = Date.now()
  caseJson(JSON.stringify(nepq.parse(example)), n)
  end = Date.now()
  ts = end - start
  console.log(Math.floor(n / ts * 1000) + ' case/sec (json)')*/
}

function caseJson (example, n) {
  for (var i = 0; i < n; ++i) {
    JSON.parse(example)
  }
}

function caseNq (example, n) {
  for (var i = 0; i < n; ++i) {
    nepq.parse(example)
  }
}

function caseNqFastParse (example, n) {
  for (var i = 0; i < n; ++i) {
    nepq.fastParse(example)
  }
}
