/* eslint-env mocha */

const nepq = require('./build/index')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

fs.readdirSync(path.join(__dirname, 'test'))
  .filter(function (x) { return x.substr(-3) === '.js' })
  .map(function (x) { return x.substr(0, x.length - 3) })
  .forEach(function (x) {
    var t = require('./test/' + x)
    var n = nepq.parse(t.nepq)
    var o = t.obj
    it('parser: ' + x, function (cb) {
      assert.deepEqual(n, o)
      cb()
    })

    var k = t.response
    it('response: ' + x, function (cb) {
      nepq.response(n, t.result, function (r) {
        assert.deepEqual(r, k)
        cb()
      })
    })
  })
