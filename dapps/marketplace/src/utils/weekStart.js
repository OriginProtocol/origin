import { IntlViewerContext } from 'fbt-runtime'
import { getWeekStartByLocale } from 'weekstart'
import startOfWeek from 'date-fns/start_of_week'

export function weekStartDay() {
  return getWeekStartByLocale(IntlViewerContext.locale)
}

export default function weekStart(date = new Date()) {
  return startOfWeek(date, { weekStartsOn: weekStartDay() })
}
