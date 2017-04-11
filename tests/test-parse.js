const thriftParser = require('../thrift-parser');
const assert = require('assert');
const fs = require('fs');
const expectoin = require('./test-parse.expection.json');

fs.readFile('./test.thrift', (error, buffer) => {
  expectoin.include['okay.thrift'] = expectoin.include['okay.thrift'].replace('{cwd}', process.cwd());
  let ast = thriftParser(buffer);
  // console.log(JSON.stringify(ast, null, 2));
  assert.deepEqual(ast, expectoin);
});
