// Safe get method
export const get = (obj, path, defaultValue = null) =>
  String.prototype.split
    .call(path, /[,[\].]+?/)
    .filter(Boolean)
    .reduce(
      (a, c) => (Object.hasOwnProperty.call(a, c) ? a[c] : defaultValue),
      obj
    )
