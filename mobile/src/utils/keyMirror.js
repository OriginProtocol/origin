export default function(obj, namespace) {
  let key
  const ret = {}

  for (key in obj) {
    if (namespace) {
      ret[key] = namespace + '_' + key
    } else {
      ret[key] = key
    }
  }
  return ret
}
