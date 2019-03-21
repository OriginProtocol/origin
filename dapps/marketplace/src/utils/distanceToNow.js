export default function distanceToNow(timestamp) {
  const now = new Date().getTime()
  if (typeof timestamp === 'string') timestamp = Number(timestamp)
  const diff = now / 1000 - timestamp
  if (diff < 60) {
    return '<1m'
  } else if (diff < 3600) {
    return `${Math.round(diff / 60)}m`
  } else if (diff < 86400) {
    return `${Math.round(diff / 3600)}h`
  }
  return `${Math.round(diff / 86400)}d`
}
