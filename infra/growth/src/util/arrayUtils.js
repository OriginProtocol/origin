function flatMap(f, xs) {
  return xs.map(f).reduce((a, b) => [...a, ...b], [])
}

module.exports = { flatMap }
