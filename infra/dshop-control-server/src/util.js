const slugify = require('slugify')

const titleToId = str => {
  return slugify(str.toLowerCase().replace(/[^a-zA-Z0-9-_]/g, '-'), '-')
}

module.exports = {
  titleToId
}
