import { fbt } from 'fbt-runtime'

export default function distanceToNow(timestamp, { long, showJustNow } = {}) {
  const now = new Date().getTime()
  if (typeof timestamp === 'string') timestamp = Number(timestamp)
  const diff = now / 1000 - timestamp
  if (diff < 60) {
    return showJustNow
      ? fbt('Just now', 'time.justNow')
      : `<1${long ? ` ${fbt('minute', 'time.minute')}` : 'm'}`
  } else if (diff < 3600) {
    const numberMinutes = Math.round(diff / 60)
    return `${numberMinutes}${
      long
        ? ` ${fbt(
            fbt.plural('minute', numberMinutes, {
              name: 'number of minutes',
              many: 'minutes'
            }),
            'time.minutes'
          )}`
        : 'm'
    }`
  } else if (diff < 86400) {
    const numberHours = Math.round(diff / 3600)
    return `${numberHours}${
      long
        ? ` ${fbt(
            fbt.plural('hour', numberHours, {
              name: 'number of hours',
              many: 'hours'
            }),
            'time.hours'
          )}`
        : 'h'
    }`
  }
  const numberDays = Math.round(diff / 86400)

  return `${numberDays}${
    long
      ? ` ${fbt(
          fbt.plural('day', numberDays, {
            name: 'number of days',
            many: 'days'
          }),
          'time.days'
        )}`
      : 'd'
  }`
}
