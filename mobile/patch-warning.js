/*
Removes require cycle warnings from the console

https://github.com/facebook/metro/issues/287
*/

fs = require('fs')

const codeToObscure = /console.warn\([\s]*`Require cycle[^;]*;/
const problemFilePath = './node_modules/metro/src/lib/polyfills/require.js'
const problemFileContent = fs.readFileSync(problemFilePath, 'utf8')
fs.writeFileSync(
  problemFilePath,
  problemFileContent.replace(codeToObscure, ''),
  { encoding: 'utf8' }
)
