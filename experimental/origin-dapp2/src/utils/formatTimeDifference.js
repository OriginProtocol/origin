import dayjs from 'dayjs'

export default function formatTimeDifference(start, end) {
  let timeLabel = ''
  const timeDiffDays = dayjs(end).diff(dayjs(start), 'day')
  const timeDiffHours = dayjs(end).diff(dayjs(start), 'hour') % 24
  const timeDiffMinutes = dayjs(end).diff(dayjs(start), 'minute') % 60

  if (timeDiffDays > 0) {
    timeLabel += ` ${timeDiffDays}d`
  }
  if (timeDiffHours > 0) {
    timeLabel += ` ${timeDiffHours}h`
  }
  if (timeDiffMinutes > 0) {
    timeLabel += ` ${timeDiffMinutes}m`
  }

  return timeLabel
}
