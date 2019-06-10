export default function distanceToNow(timestamp, long) {
  const now = new Date().getTime()
  if (typeof timestamp === 'string') timestamp = Number(timestamp)
  const diff = now / 1000 - timestamp
  if (diff < 60) {
    return `<1${long ? ' minute' : 'm'}`
  } else if (diff < 3600) {
    return `${Math.round(diff / 60)}${long ? ' minutes' : 'm'}`
  } else if (diff < 86400) {
    return `${Math.round(diff / 3600)}${long ? ' hours' : 'h'}`
  }
  return `${Math.round(diff / 86400)}${long ? ' days' : 'd'}`
}
