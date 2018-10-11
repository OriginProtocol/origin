export default function(obj, namespace) {
  const ret = {}
  let key

  for (key in obj) {
    if (namespace) {
      ret[key] = namespace + '_' + key
    } else {
      ret[key] = key
    }
  }
  return ret
}
