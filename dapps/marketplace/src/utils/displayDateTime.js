import { IntlViewerContext } from 'fbt-runtime'
import memoizeFormatConstructor from 'intl-format-cache'
import { toBCP47 } from 'constants/Languages'

const getFmt = memoizeFormatConstructor(Intl.DateTimeFormat)

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
