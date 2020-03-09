export default function joinURLPath() {
  let urlString = ''
  Array.prototype.map.call(arguments, part => {
    if (urlString === '') {
      urlString = part
    } else {
      urlString += `${urlString.endsWith('/') ? '' : '/'}${part}`
    }
  })
  return urlString
}
