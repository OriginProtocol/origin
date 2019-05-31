const fs = require('fs')
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

const packageFiles = {}
const allPackages = {}
rl.on('line', function(line) {
  const json = JSON.parse(fs.readFileSync(line).toString())
  const dep = json.dependencies || {}
  const dev = json.devDependencies || {}
  const packages = { ...dep, ...dev }
  Object.keys(packages).forEach(p => (allPackages[p] = [line, packages[p]]))
  packageFiles[line] = packages
})

const output = {}
const hasDiffs = {}
rl.on('close', () => {
  const packageNames = Object.keys(allPackages).sort()
  packageNames.forEach(pck => {
    const knownVersion = allPackages[pck][1]
    Object.keys(packageFiles).forEach(filePck => {
      if (packageFiles[filePck][pck]) {
        const isDiff = packageFiles[filePck][pck] !== knownVersion
        if (isDiff) {
          hasDiffs[pck] = true
        }
        output[pck] = output[pck] || []
        output[pck].push([`${filePck} ${packageFiles[filePck][pck]}`, isDiff])
      }
    })
    // console.log(knownVersion)
  })
  Object.keys(hasDiffs)
    .sort()
    .forEach(pck => {
      const numDiff = output[pck].filter(i => i[1]).length + 1
      const rev = output[pck].length === numDiff
      const ok = rev ? ' ' : 'X'
      const isDiff = rev ? 'X' : ' '
      console.log()
      console.log(pck)
      output[pck].forEach(i => {
        console.log(` ${i[1] ? ok : isDiff} ${i[0]}`)
      })
    })
})
