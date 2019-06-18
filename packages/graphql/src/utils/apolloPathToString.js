/**
 * Takes an apollo path from an info object and converts it to the FQ path
 * string with dot notation.
 * @param path {object} The path object from info.path
 * @returns {string} The FQ path string with dot notation
 */
export default function apolloPathToString(path) {
  let prefix = ''
  if (path.prev) {
    prefix = apolloPathToString(path.prev)
  }
  return `${prefix ? prefix + '.' : ''}${path.key}`
}
