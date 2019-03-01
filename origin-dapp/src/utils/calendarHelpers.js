import moment from 'moment-timezone'
import uuid from 'utils/uuid'

export function generateCalendarSlots(jCal) {
  const events = jCalToCalendarSlots(jCal)

  for (let i = 0, eventsLen = events.length; i < eventsLen; i++) {
    const event = events[i]
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

  return events
}

// Generate a slot with start / end dates that are one slotLength long according to the listing schema
export function generateSlotStartEnd(selectionStart, viewType, slotIndex) {
  const slotLength = viewType === 'hourly' ? 'hour' : 'day'
  const start = moment(selectionStart).add(slotIndex, slotLength)
  const end = moment(selectionStart).add(slotIndex, slotLength).add(1, slotLength).subtract(1, 'second')
  return {
    start: start.toDate(),
    end: end.toDate()
  }
}

export function checkSlotForExistingEvents(slotInfo, events) {
  return events.filter((event) => {
    let isEventInSlot = false

    // loop over event's slots and check to see if any of them
    // match any of the selected slot's time periods
    for (let i = 0, existSlotsLen = event.slots && event.slots.length; i < existSlotsLen; i++) {
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

// Returns true if all passed-in events are recurring events and false if not
export function doAllEventsRecur(events) {
  const recurringEvents = events.filter((event) => event.isRecurringEvent )
  return recurringEvents.length === events.length
}

// Used in the dateCellWrapper callback to determine if a particular date is selected
export function isDateSelected(selection, calendarDate) {
  if (!selection) {
    return false
  }

  let selected = false

  function isSelected(slot) {
    return moment(calendarDate).isBetween(moment(slot.start).subtract(1, 'second'), moment(slot.end).add(1, 'second'))
  }

  if (Array.isArray(selection)) {
    const selectedDates = selection.filter((slot) =>
      isSelected(slot)
    )

    selected = selectedDates && !!selectedDates.length
  } else {
    selected = isSelected(selection)
  }

  return selected
}

// This is a hackey way of showing the price in hourly time slots
// since React Big Calendar doesn't give us full control over the content of those slots
// Possible future optimization would be to create a PR to React Big Calendar to support custom slot content.
export function renderHourlyPrices(viewType) {
  if (viewType && viewType === 'hourly') {
    const slots = document.querySelectorAll('.rbc-time-slot')

    for (let i = 0, slotsLen = slots.length; i < slotsLen; i++) {
      const slot = slots[i]
      const classes = slot.className
      const isAvailable = classes.indexOf('unavailable') === -1
      const priceIdx = classes.indexOf('priceEth-')

      // slot.innerHTML = ''
      const childSpan = slot.querySelector('span')
      if (childSpan && !childSpan.className.includes('rbc-label')) {
        childSpan.remove()
      }


      if (priceIdx > -1 && isAvailable) {
        const price = classes.substring(priceIdx + 9, classes.length)
        const priceWrapper = document.createElement('span')
        const priceText = document.createTextNode(`${price} ETH`)
        priceWrapper.appendChild(priceText)
        slot.appendChild(priceWrapper)
      }
    }
  }
}

// Re-calculates slots after the date is changed via the dropdown menus
export function getSlotsForDateChange(selectedEvent, whichDropdown, value, viewType) {
  const startDate = whichDropdown === 'start' ? new Date(value) : new Date(selectedEvent.start)
  const endDate = whichDropdown === 'end' ? new Date(value) : new Date(selectedEvent.end)
  const slots = []
  let slotDate = moment(value)

  while (slotDate.toDate() >= startDate && slotDate.toDate() <= endDate) {
    const timePeriod = viewType === 'daily' ? 'day' : 'hour'
    const slotDateObj = timePeriod ? slotDate.startOf(timePeriod).toDate() : slotDate.toDate()

    if (whichDropdown === 'start') {
      slots.push(slotDateObj)
      slotDate = slotDate.add(1, timePeriod)
    } else {
      slots.unshift(slotDateObj)
      slotDate = slotDate.subtract(1, timePeriod)
    }
  }

  return slots
}

export function getDateDropdownOptions(date, viewType, userType, selectedEvent, allEvents, offers) {
  const numDatesToShow = 10
  const timeToAdd = viewType === 'daily' ? 'days' : 'hours'
  let beforeSelectedConflict
  let afterSelectedConflict

  const isSlotAvailable = (date) => {
    const eventsWithoutSelected = allEvents &&
      allEvents.length &&
      allEvents.filter((event) => event.id !== selectedEvent.id)

    if (!eventsWithoutSelected || !eventsWithoutSelected.length) {
      return true
    }
    if (viewType === 'daily') {
      date = moment(date).startOf('day').toDate()
    }
    const slotInfo = { slots: [date] }
    const existingEventInSlot = checkSlotForExistingEvents(slotInfo, eventsWithoutSelected)
    return !existingEventInSlot.length || doAllEventsRecur(existingEventInSlot)
  }

  const selectedTime = moment(date).toDate()

  const beforeSelected = [...Array(numDatesToShow)]
    .map((_, i) => {
      const thisDate = moment(date).subtract(i + 1, timeToAdd).toDate()
      if (!beforeSelectedConflict) {
        let isAvailable

        if (userType === 'seller') {
          isAvailable = isSlotAvailable(thisDate)
        } else {
          const availData = getDateAvailabilityAndPrice(thisDate, allEvents, offers)
          isAvailable = availData.isAvailable
        }

        if (isAvailable) {
          return thisDate
        } else {
          beforeSelectedConflict = true
          return null
        }
      } else {
        return null
      }
    })
    .filter((d) => d)
    .reverse()

  if (viewType === 'hourly') {
    let isAvailable

    if (userType === 'seller') {
      isAvailable = isSlotAvailable(date)
    } else {
      const availData = getDateAvailabilityAndPrice(date, allEvents, offers)
      isAvailable = availData.isAvailable
    }
    if (!isAvailable) {
      afterSelectedConflict = true
    }
  }

  const afterSelected = [...Array(numDatesToShow)]
    .map((_, i) => {
      const thisDate = moment(date).add(i + 1, timeToAdd).toDate()
      if (!afterSelectedConflict) {
        let isAvailable

        if (userType === 'seller') {
          isAvailable = isSlotAvailable(thisDate)
        } else {
          const availData = getDateAvailabilityAndPrice(thisDate, allEvents, offers)
          isAvailable = availData.isAvailable
        }

        if (isAvailable) {
          return thisDate
        } else {
          afterSelectedConflict = true
          if (viewType === 'hourly') {
            return thisDate
          } else {
            return null
          }
        }
      } else {
        return null
      }
    })
    .filter((d) => d)

  return [
    ...beforeSelected,
    selectedTime,
    ...afterSelected
  ]
}

export function getRecurringEvents(date, existingEvents, viewType) {

  const dateMoment = moment(date)
  const isDaily = viewType === 'daily'
  const firstVisibleDate = isDaily ?
    moment(dateMoment.startOf('month')).subtract(1, 'week') :
    moment(dateMoment.startOf('week'))
  const lastVisibleDate = isDaily ?
    moment(dateMoment.endOf('month')).add(1, 'week') :
    moment(dateMoment.endOf('week'))
  const events = []

  const getSlots = (startDate, endDate) => {
    const slots = []
    let slotDate = moment(startDate)

    while (slotDate.toDate() >= startDate && slotDate.toDate() <= endDate) {
      const timePeriod = viewType === 'daily' ? 'day' : 'hour'
      const slotDateObj = timePeriod ? slotDate.startOf(timePeriod).toDate() : slotDate.toDate()

      slots.push(slotDateObj)
      slotDate = slotDate.add(1, timePeriod)
    }

    // remove the last slot to prevent blocking the slot after the event
    if (!isDaily) {
      slots.pop()
    }

    return slots
  }

  // render recurring events on the currently visible day they recur on
  existingEvents && existingEvents.map((event) => {
    if (event.isRecurringEvent) {
      if (!event.isClonedRecurringEvent) {
        const slotToTest = moment(firstVisibleDate)

        // put the original event in the output "events" array
        const originalEventStartDate = event.start
        events.push(event)

        while (slotToTest.isBefore(lastVisibleDate)) {
          const slotDayOfWeekIdx = slotToTest.day()
          const eventDayOfWeekIdx = moment(event.start).day()

          if (slotDayOfWeekIdx === eventDayOfWeekIdx) {
            const clonedEvent = JSON.parse(JSON.stringify(event))
            const diffBtwStartAndEnd = moment(clonedEvent.end).diff(moment(clonedEvent.start), 'days')
            const clonedEndMoment = moment(clonedEvent.end)
            const setterConfig = {
              date: slotToTest.date(),
              month: slotToTest.month(),
              year: slotToTest.year()
            }
            clonedEvent.originalEventId = event.id
            clonedEvent.id = uuid()
            clonedEvent.isClonedRecurringEvent = true
            clonedEvent.start = moment(clonedEvent.start).set(setterConfig).toDate()
            clonedEvent.end = moment(clonedEvent.start)
              .add(diffBtwStartAndEnd, 'days')
              .set({
                hour: clonedEndMoment.hour(),
                minute: clonedEndMoment.minute(),
                second: clonedEndMoment.second()
              })
              .toDate()
            clonedEvent.slots = getSlots(clonedEvent.start, clonedEvent.end)

            // put the cloned "recurring" instances of the event in the output "events" array
            if (clonedEvent.start.toString() !== originalEventStartDate.toString())
              events.push(clonedEvent)
          }

          slotToTest.add(1, 'day')
        }
      }
    } else if (!event.isClonedRecurringEvent) {
      // put the non-recurring events in the output "events" array
      events.push(event)
    }
  })

  return events
}

// When buyer is ready to reserve slots, prepares data to be saved to IPFS
export function getSlotsToReserve(buyerSelectedSlotData) {
  const slots = buyerSelectedSlotData &&
          buyerSelectedSlotData.map((slot) => {
            const toReturn = {
              startDate: slot.start,
              endDate: slot.end,
              timeZone: slot.timeZone,
              price: slot.price,
            }

            if (slot.isRecurringEvent) {
              toReturn.rrule = 'FREQ=WEEKLY;'
            }

            return toReturn
          }) || []

  return slotsToJCal(slots, 'offer')
}

// Removes cloned events and prepares data for saving to IPFS
export function getCleanEvents(events) {
  return events.length && events
    .filter((event) => 
      !event.isClonedRecurringEvent
    )
    .map((event) => {

      const toReturn = {
        startDate: event.start.toISOString(),
        endDate: event.end.toISOString(),
        timeZone: event.timeZone,
        isAvailable: event.isAvailable,
        price: event.price
      }

      if (event.isRecurringEvent) {
        toReturn.rrule = 'FREQ=WEEKLY;'
      }
      return toReturn
    })
}

export function getDateAvailabilityAndPrice(date, events, offers) {
  const isDateBooked = function(date) {
    let bookingsMatchingDate = []
    offers && offers.map((offer) => {
      const offerSlots = jCalToCalendarSlots(offer.timeSlots) || []
      const bookingsForThisOffer = offerSlots.filter(slot => 
          moment(date).isBetween(moment(slot.startDate).subtract(1, 'second'), moment(slot.endDate).add(1, 'second'))
        )
      bookingsMatchingDate = [...bookingsMatchingDate, ...bookingsForThisOffer]
    })

    return !!bookingsMatchingDate.length
  }

  const eventsInSlot = []
  let toReturn = {
    isAvailable: false,
    price: 0
  }

  if (events && events.length) {
    for (let i = 0, len = events.length; i < len; i++) {
      const event = events[i]
      if (  
        moment(date).isBetween(moment(event.start).subtract(1, 'second'), moment(event.end).add(1, 'second')) &&
        !moment(date).isBefore(moment().startOf('day'))
      ) {

        const eventClone = JSON.parse(JSON.stringify(event))

        eventClone.isAvailable = eventClone.isAvailable ? !isDateBooked(date) : false
        eventsInSlot.push(eventClone)
      }
    }
  }

  if (eventsInSlot.length) {
    const nonRecurringEvents = eventsInSlot.filter((event) => !event.isRecurringEvent)

    if (nonRecurringEvents.length) {
      toReturn = nonRecurringEvents[0]
    } else {
      toReturn = eventsInSlot[0]
    }
  }

  return toReturn
}

export const slotsToJCal = (events, listingOrOffer) => {
  const jCal = [
    'vcalendar',
      [
        ['version', {}, 'text', '1.0'],
        ['prodid', {}, 'text', 'origin.js'],
      ]
  ]

  events && events.forEach((event) => {
    const { startDate, endDate, price, rrule, isAvailable } = event
    const vEvent = [
      'vevent',
      ['uid', {}, 'text', uuid()],
      [
        'dtstart',
        { 'tzid': '/US/Eastern' },
        'date-time',
        typeof startDate === 'string' ? startDate : startDate.toISOString()
      ],
      [
        'dtend',
        { 'tzid': '/US/Eastern' },
        'date-time',
        typeof endDate === 'string' ? endDate : endDate.toISOString()
      ],
      ['x-currency', {}, 'text', 'ETH'], 
      ['x-price', {}, 'text', price.toString()]
    ]

    if (listingOrOffer === 'listing') {
      vEvent.splice(4, 0, ['rrule', {}, 'text', (rrule || '')])
      vEvent.push.apply(
        vEvent,
        [
          ['x-is-available', {}, 'boolean', isAvailable],
          ['x-priority', {}, 'integer', rrule ? 1 : 2]
        ]
      )
    }

    jCal.push(vEvent)
  })

  return jCal
}

export const jCalToCalendarSlots = (jCal) => {
  const vEvents = jCal.filter(item => item[0] === 'vevent')
  return vEvents.map(vEvent => {
    const rrule = vEvent.find(item => item[0] === 'rrule')
    const isAvailable = vEvent.find(item => item[0] === 'x-is-available')
    const priority = vEvent.find(item => item[0] === 'x-priority')

    return {
      uid: vEvent.find(item => item[0] === 'uid')[3],
      startDate: vEvent.find(item => item[0] === 'dtstart')[3],
      endDate: vEvent.find(item => item[0] === 'dtend')[3],
      timeZone: vEvent.find(item => item[0] === 'dtstart')[1].tzid,
      rrule: rrule ? rrule[3] : '',
      price: {
        amount: vEvent.find(item => item[0] === 'x-price')[3],
        currency: vEvent.find(item => item[0] === 'x-currency')[3]
      },
      isAvailable: isAvailable ? isAvailable[3] : '',
      priority: priority ? priority[3] : ''
    }
  })
}

export const getTotalPriceFromJCal = (jCal) => {
  const vEvents = jCal.filter(item => item[0] === 'vevent')
  const prices = vEvents.map(event => event.find(item => item[0] === 'x-price')[3])

  return prices.reduce((totalPrice, nextPrice) => totalPrice + parseFloat(nextPrice), 0).toString()
}

export const getStartEndDatesFromSlots = (slots, slotLengthUnit) => {
  const timeFormat = slotLengthUnit === 'schema.hours' ? 'l LT' : 'LL'

  return {
    startDate: moment(slots[0].startDate).format(timeFormat),
    endDate: moment(slots[slots.length - 1].endDate).format(timeFormat)
  }
}

export const generateDefaultPricing = (formData) => {
  const events = []

  for (const key in formData) {
    if (key === 'weekdayPricing' || key === 'weekendPricing') {

      const startDateDayOffset = key === 'weekdayPricing' ? /* Sunday */ 0 : /* Friday */ 5        
      const endDateDayOffset = key === 'weekdayPricing' ? /* Thursday */ 4 : /* Saturday */ 6

      events.push({
        startDate: moment().day(startDateDayOffset).startOf('day').toDate(),
        endDate: moment().day(endDateDayOffset).endOf('day').toDate(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        rrule: 'FREQ=WEEKLY;',
        isAvailable: true,
        price: formData[key]
      })
    }
  }

  return slotsToJCal(events, 'listing')
}

export const highlightCalendarDrag = () => {
  setTimeout(() => {
    const calendarDays = [...document.querySelectorAll('.rbc-day-bg')]

    function addDraggingClass(evt) {
      if (evt.target.classList.value.includes('available')) {
        evt.target.classList.add('dragging')
      }
    }

    function mouseUpHandler(evt){
      const calendarDays = [...document.querySelectorAll('.rbc-day-bg')]

      calendarDays.map((element) => {
        element.removeEventListener('mousemove', addDraggingClass)
        setTimeout(() => { evt.target.classList.remove('dragging') }, 300)
      })
    }

    function mouseDownHandler(evt) {
      const calendarDays = [...document.querySelectorAll('.rbc-day-bg')]

      addDraggingClass(evt)

      calendarDays.map((element) => {
        element.addEventListener('mousemove', addDraggingClass)
      })
    }

    calendarDays.map((element) => {
      element.removeEventListener('mousedown', mouseDownHandler)
      element.addEventListener('mousedown', mouseDownHandler)
    })

    document.removeEventListener('mouseup', mouseUpHandler)
    document.addEventListener('mouseup', mouseUpHandler)
  }, 1000)
}

export const doFancyDateSelectionBorders = () => {
  const calendarDays = [...document.querySelectorAll('.rbc-day-bg.selected, .rbc-day-bg.dragging')]

  calendarDays.map((element, index) => {
    element.classList.remove('first-selected', 'last-selected', 'middle-selected')

    const prevDate = calendarDays[index - 1]
    const nextDate = calendarDays[index + 1]
    let isFirstSelected = true
    let isLastSelected = true

    if (
      prevDate &&
      (
        prevDate.classList.contains('selected') || 
        prevDate.classList.contains('dragging')
      )
    ) {
      isFirstSelected = false
    }

    if (
      nextDate &&
      (
        nextDate.classList.contains('selected') || 
        nextDate.classList.contains('dragging')
      )
    ) {
      isLastSelected = false
    }

    if (isFirstSelected && isLastSelected) {
      return
    } else if (isFirstSelected) {
      element.classList.add('first-selected')
    } else if (isLastSelected) {
      element.classList.add('last-selected')
    } else {
      element.classList.add('middle-selected')
    }
  })
}

export const deSelectAllCells = () => {
  [...document.querySelectorAll('.rbc-day-bg')].map(
    (element) => element.classList.remove('selected', 'dragging')
  )
}
