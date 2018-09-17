export default function(xs, key) {
  return xs.reduce((rv, x) => {
    const v = key instanceof Function ? key(x) : x[key]
    const el = rv.find(r => r && r.key === v)

    if (el) {
      el.values.push(x)
    } else {
      rv.push({ key: v, values: [x] })
    }

    return rv
  }, [])
}
