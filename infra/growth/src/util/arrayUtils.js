function concat (x,y) {
  return x.concat(y)
}   

function flatMap (f,xs) {
  return xs.map(f).reduce(concat, [])
}

module.exports = { concat, flatMap }