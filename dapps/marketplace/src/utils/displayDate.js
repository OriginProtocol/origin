import get from 'lodash/get'
import set from 'lodash/set'
import { IntlViewerContext } from 'fbt-runtime'

const fmtCache = {}

function toBCP47(locale) {
  if (locale === 'zh_CN') return 'zh-Hans-CN'
  if (locale === 'zh_TW') return 'zh-Hant-TW'
  return locale.replace('_', '-')
}

export default function displayDate(date) {
  const locale = IntlViewerContext.locale
  const cacheKey = [locale]
  let fmt = get(fmtCache, cacheKey)
  if (!fmt) {
    const tag = toBCP47(locale)
    const opts = {
      weekday: 'short',
      day: 'numeric',
      month: 'long'
    }
    fmt = new Intl.DateTimeFormat(tag, opts)
    set(fmtCache, cacheKey, fmt)
  }

  return fmt.format(date)
}
