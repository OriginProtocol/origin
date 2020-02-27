function formatAddress(data) {
  if (!data) return []
  const address = []
  let name = ''
  if (data.firstName) {
    name += data.firstName
  }
  if (data.lastName) {
    name += `${name.length ? ' ' : ''}${data.lastName}`
  }
  if (name.length) {
    address.push(name)
  }
  if (data.address1) {
    address.push(data.address1)
  }
  let line3 = ''
  if (data.city) {
    line3 += data.city
  }
  if (data.province) {
    line3 += `${line3.length ? ' ' : ''}${data.province}`
  }
  if (data.zip) {
    line3 += `${line3.length ? ' ' : ''}${data.zip}`
  }
  if (line3.length) {
    address.push(line3)
  }
  if (data.country) {
    address.push(data.country)
  }
  return address
}

module.exports = formatAddress
