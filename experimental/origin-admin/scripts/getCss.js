const { execSync } = require('child_process')
const Styl = require('react-styl')

const css = execSync(`find ./src -type f -print | xargs awk "/require\\('react-styl'\\)\\(/{flag=1; next} /\\\`\\)/{flag=0} flag"`)
Styl(css.toString())
console.log(Styl.getCss())
