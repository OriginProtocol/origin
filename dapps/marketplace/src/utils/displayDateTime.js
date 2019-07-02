import { IntlViewerContext } from 'fbt-runtime'
import memoizeFormatConstructor from 'intl-format-cache'

const getFmt = memoizeFormatConstructor(Intl.DateTimeFormat)

function toBCP47(locale) {
  if (locale === 'zh_CN') return 'zh-Hans-CN'
  if (locale === 'zh_TW') return 'zh-Hant-TW'
  if (locale === 'pt_PT') return 'pt' // With shortened weekdays
  return locale.replace('_', '-')
}

const defaultOpts = {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric'
}

export default function displayDateTime(date, opts = defaultOpts) {
  const locale = toBCP47(IntlViewerContext.locale)
  return getFmt(locale, opts).format(date)
}
