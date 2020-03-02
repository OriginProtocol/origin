const slugify = require('slugify')

const titleToId = str => {
  return slugify(str.toLowerCase().replace(/[^a-zA-Z0-9-_]/g, '-'), '-')
}

function joinURLPath() {
  let urlString = ''
  Array.prototype.map.call(arguments, (part) => {
    console.log('urlString:', urlString)
    console.log('part:', part)
    if (urlString === '') {
      urlString = part
    } else {
      urlString += `${urlString.endsWith('/') ? '' : '/'}${part}`
    }
  })
  return urlString
}

module.exports = {
  titleToId,
  joinURLPath
}
