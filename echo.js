'use strict'
const nepq = require('./build/index')
const readline = require('readline')

const l = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function loop () {
  l.question('NepQ: ', function (r) {
    console.log(JSON.stringify(nepq.parse(r), null, 2))
    loop()
  })
}

loop()
