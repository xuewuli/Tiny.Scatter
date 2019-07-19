const fs = require('fs-extra');

const filePath = './dist/tiny_scatter_min.js';

async function doConvert() {
  const js = await fs.readFile(filePath, 'utf-8');
  const json = `module.exports = ${JSON.stringify(js)};`;
  await fs.writeFile('./demo/inject/tiny_scatter.js', json);
}

doConvert();
