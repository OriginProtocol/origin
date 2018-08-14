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

export function checkSlotsForExistingEvent(slotInfo, events) {
    return events.filter((event) => {
      let isEventInSlot = false

      // loop over event's slots and check to see if any of them
      // match any of the selected slot's time periods
      for (let i = 0, existSlotsLen = event.slots.length; i < existSlotsLen; i++) {
        const existSlot = event.slots[i]

        // loop over the time periods included in selected slot
        for (let j = 0, newSlotsLen = slotInfo.slots.length; j < newSlotsLen; j++) {
          const newSlot = slotInfo.slots[j]

          if (existSlot.toString() === newSlot.toString()) {
            isEventInSlot = true
          }
        }
      }

      return isEventInSlot
    })
  }
