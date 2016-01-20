var nepq = require('./build/index');
var readline = require('readline');

var l = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function loop() {
  l.question('NepQ: ', function(r) {
    console.log(nepq.parse(r));
    loop();
  });
}

loop();
