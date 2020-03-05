const upperFirst = require('lodash/upperFirst')

function formatAddress(data, prefix) {
  const field = name => (prefix ? `${prefix}${upperFirst(name)}` : name)

  if (!data) return []
  const address = []
  let name = ''
  if (data[field('firstName')]) {
    name += data[field('firstName')]
  }
  if (data[field('lastName')]) {
    name += `${name.length ? ' ' : ''}${data[field('lastName')]}`
  }
  if (name.length) {
    address.push(name)
  }
  if (data[field('address1')]) {
    address.push(data[field('address1')])
  }
  let line3 = ''
  if (data[field('city')]) {
    line3 += data[field('city')]
  }
  if (data[field('province')]) {
    line3 += `${line3.length ? ' ' : ''}${data[field('province')]}`
  }
  if (data[field('zip')]) {
    line3 += `${line3.length ? ' ' : ''}${data[field('zip')]}`
  }
  if (line3.length) {
    address.push(line3)
  }
  if (data[field('country')]) {
    address.push(data[field('country')])
  }
  return address
}

module.exports = formatAddress
