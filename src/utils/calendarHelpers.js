import moment from 'moment'

export function generateCalendarSlots(events) {

  const eventsClone = JSON.parse(JSON.stringify(events))

  for (let i = 0, eventsLen = eventsClone.length; i < eventsLen; i++) {
    const event = eventsClone[i]
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    let eventDate = moment(event.startDate)
    const slots = []

    // convert start and end date strings in to date objects
    event.startDate = startDate
    event.endDate = endDate

    while (eventDate.toDate() >= startDate && eventDate.toDate() <= endDate) {
        slots.push(eventDate.toDate())
        eventDate = eventDate.add(1, 'days')
    }

    event.slots = slots
  }

  return eventsClone
}
