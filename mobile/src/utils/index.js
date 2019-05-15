// Safe get method
export function get(object, path, defval = null) {
  if (typeof path === 'string') path = path.split('.')
  return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : defval), object)
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
