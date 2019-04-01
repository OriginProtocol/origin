import format from 'date-fns/format'

export default function formatDate(timestamp) {
  return format(new Date(timestamp * 1000), 'MM/DD/YYYY h:mm a')
}
