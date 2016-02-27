/* eslint-env mocha */
'use strict'
const nepq = require('./build/index')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

fs.readdirSync(path.join(__dirname, 'test'))
  .filter(function (x) { return x.substr(-3) === '.js' })
  .map(function (x) { return x.substr(0, x.length - 3) })
  .forEach(function (x) {
    let t = require('./test/' + x)
    let n = nepq.parse(t.nepq)
    let f = nepq.fastParse(t.nepq)
    let o = t.obj
    it('parser: ' + x, function (cb) {
      assert.deepEqual(n, o)
      cb()
    })

    it('fast parser: ' + x, function (cb) {
      assert.deepEqual(f, o)
      cb()
    })

    let k = t.response
    it('response: ' + x, function (cb) {
      nepq.response(n, t.result, function (r) {
        assert.deepEqual(r, k)
        cb()
      })
    })
  })
