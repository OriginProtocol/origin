export default function(obj, namespace) {
  var ret = {},
    key

  for (key in obj) {
    if (namespace) {
      ret[key] = namespace + '_' + key
    } else {
      ret[key] = key
    }
  }
  return ret
}
