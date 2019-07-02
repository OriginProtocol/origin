import { fbt, IntlViewerContext } from 'fbt-runtime'
import memoizeFormatConstructor from 'intl-format-cache'
import { toBCP47 } from 'constants/Languages'

const getFmt = memoizeFormatConstructor(Intl.RelativeTimeFormat)

const defaultOpts = {
  numeric: 'always',
  style: 'short'
}

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const asInt = x => (x > 0 ? Math.floor(x) : Math.ceil(x))

export default function displayTimeDiff(diff, options = defaultOpts) {
  const unit = options.unit

  const opts = { ...options }
  delete opts.unit

  const locale = toBCP47(IntlViewerContext.locale)
  const fmt = getFmt(locale, opts)

  const absDiff = Math.abs(diff)
  if (!unit) {
    if (absDiff < MINUTE_MS) {
      const seconds = asInt(diff / SECOND_MS)
      if (diff < 0) {
        if (opts.style === 'long') {
          return fbt('less than 1 minute ago', 'locale.lessThanMinute.long')
        } else if (opts.style === 'short') {
          return fbt('<1 minute ago', 'locale.lessThanMinute.short')
        } else if (opts.style === 'narrow') {
          return fbt('<1 min. ago', 'locale.lessThanMinute.narrow')
        }
      }
      return fmt.format(seconds, 'second')
    } else if (absDiff < HOUR_MS) {
      const minutes = asInt(diff / MINUTE_MS)
      return fmt.format(minutes, 'minute')
    } else if (absDiff < DAY_MS) {
      const hours = asInt(diff / HOUR_MS)
      return fmt.format(hours, 'hour')
    }
    const days = asInt(diff / DAY_MS)
    return fmt.format(days, 'day')
  }

  return getFmt(locale, opts).format(diff, unit)
}
