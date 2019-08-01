const fs = require('fs');

const filePath = './dist/tiny_scatter.js';

function doConvert() {
  const js = fs.readFileSync(filePath, 'utf8');
  const json = `module.exports = ${JSON.stringify(js)};`;
  fs.writeFileSync('./demo/inject/tiny_scatter.js', json);
}

doConvert();
