export default function formatPrice(number, opts = {}) {
  const { dec = 2, dsep = '.', tsep = ',' } = opts
  if (opts.free && !number) {
    return 'Free'
  }
  number = (number / 100).toFixed(~~dec)
  const parts = number.split('.'),
    fnums = parts[0],
    decimals = parts[1] && parts[1] > 0 ? dsep + parts[1] : ''

  return `$${fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep)}${decimals}`
}
