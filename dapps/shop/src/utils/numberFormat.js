export default function numberFormat(
  number,
  dec,
  dsep = '.',
  tsep = ',',
  shortForm = false
) {
  if (isNaN(number) || number == null) return ''
  let shortenAmount = 1
  let shortenLetter = ''

  if (number > 1000000 && shortForm) {
    shortenAmount = 1000000
    shortenLetter = 'M'
  } else if (number > 1000 && shortForm) {
    shortenAmount = 1000
    shortenLetter = 'K'
  }

  number = (number / shortenAmount).toFixed(~~dec)

  const parts = number.split('.'),
    fnums = parts[0],
    decimals = parts[1] && parts[1] > 0 ? dsep + parts[1] : ''

  return `${fnums.replace(
    /(\d)(?=(?:\d{3})+$)/g,
    '$1' + tsep
  )}${decimals}${shortenLetter}`
}
