import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

// Example:
// const instance = new AvailabilityCalculator({
//   customPricing: ['2019-03-01T01:00:00/2019-03-01T02:00:00~0.6']
// })

// const Keys = ['unavailable', 'booked', 'customPricing']

class AvailabilityCalculatorHourly {
  constructor(opts) {
    this.opts = opts
    this.opts.unavailable = this.opts.unavailable || []
    this.opts.booked = this.opts.booked || []
    this.opts.customPricing = this.opts.customPricing || []
    this.opts.timeZone = this.opts.timeZone || ''
    this.opts.workingHours = this.opts.workingHours || []
    this.opts.price = this.opts.price || ''
  }

  /**
   * Update availability for a given datetime range.
   * @param range         Datetime range (eg `2019-03-01T01:00:00/2019-03-01T02:00:00`)
   * @param availability  'available', 'unavailable', 'booked'
   * @param price         '0.1', 'reset' (Reset=return to default price for this time)
   * Returns array of modified slots
   */
  update(range, availability, price) {
    // Get availabitilty for one year into the future from now for each hour
    const slotRangeMax = dayjs().add(1, 'year')
    const slots = this.getAvailability(dayjs(), slotRangeMax)

    const [startStr, endStr] = range.split('/')
    const start = dayjs(startStr),
      // We subtract 1 hour because the human-readable range
      // e.g. 6-7pm is actually just the 6pm slot -- so range is 6pm-6pm
      end = dayjs(endStr).add(-1, 'hour')

    if (start.isBefore(dayjs()) || end.isAfter(slotRangeMax)) {
      throw 'Cannot update() range outside of one year limit.'
    }

    const modifiedSlots = []
    let bookedRange, unavailableRange, customPriceRange
    const newBooked = [],
      newUnavailable = [],
      newCustomPrice = []

    slots.forEach(slot => {
      // '[' in isBetween() indicates inclusive of start date
      if (dayjs(slot.hour).isBetween(start, end, null, '[')) {
        // Hour is part of range we're modifying
        if (availability === 'available') {
          slot.booked = false
          slot.unavailable = false
        } else if (availability === 'unavailable') {
          slot.booked = false
          slot.unavailable = true
        } else if (availability === 'booked') {
          slot.booked = true
          slot.unavailable = false
        }
        if (price === 'reset') {
          slot.customPrice = false
        } else if (price) {
          slot.customPrice = true
          slot.price = price
        }
        modifiedSlots.push(slot)
      }

      if (slot.booked) {
        if (bookedRange) {
          bookedRange = `${bookedRange.split('/')[0]}/${slot.hour}`
        } else {
          bookedRange = `${slot.hour}/${slot.hour}`
        }
      } else if (bookedRange) {
        newBooked.push(bookedRange)
        bookedRange = ''
      }
      if (slot.unavailable) {
        if (unavailableRange) {
          unavailableRange = `${unavailableRange.split('/')[0]}/${slot.hour}`
        } else {
          unavailableRange = `${slot.hour}/${slot.hour}`
        }
      } else if (unavailableRange) {
        newUnavailable.push(unavailableRange)
        unavailableRange = ''
      }

      if (slot.customPrice) {
        if (customPriceRange) {
          // Extend range to include this hour
          customPriceRange = `${customPriceRange.split('/')[0]}/${slot.hour}~${
            slot.price
          }`
        } else {
          // Begin new range
          customPriceRange = `${slot.hour}/${slot.hour}~${slot.price}`
        }
      } else if (customPriceRange) {
        // Range has ended, so save it
        newCustomPrice.push(customPriceRange)
        customPriceRange = ''
      }

      return slot
    })

    // Change our availability
    this.opts.booked = newBooked
    this.opts.unavailable = newUnavailable.filter(a => newBooked.indexOf(a) < 0)
    this.opts.customPricing = newCustomPrice

    return modifiedSlots
  }

  estimatePrice(range) {
    // Estimate price for range, including the hour of range end.
    const [startStr, endStr] = range.split('/')
    const availability = this.getAvailability(startStr, endStr)
    const available = availability.every(slot => slot.unavailable === false)
    const price = availability.reduce((m, slot) => m + Number(slot.price), 0)
    return { available, price: Math.round(price * 100000) / 100000 }
  }

  getAvailability(startStr, endStr) {
    // Get hourly availabilty between startStr and endStr, including the hour of endStr
    let start = typeof startStr === 'string' ? dayjs(startStr) : startStr
    // We add one hour so that `end` hour will also be included
    let end =
      typeof endStr === 'string'
        ? dayjs(endStr).add(1, 'hour')
        : endStr.add(1, 'hour')
    const hours = []

    if (end.isBefore(start)) {
      const newEnd = start
      start = end
      end = newEnd
    }

    const unavailable = {}
    this.opts.unavailable.forEach(range => {
      const [startStr, endStr] = range.split('/')
      let start = dayjs(startStr)
      const end = dayjs(endStr).add(1, 'hour')

      while (start.isBefore(end)) {
        unavailable[start.format('YYYY-MM-DDTHH:00:00')] = true
        start = start.add(1, 'hour')
      }
    })

    // Handle booked ranges
    const booked = {}
    this.opts.booked.forEach(range => {
      const [startStr, endStr] = range.split('/')
      let start = dayjs(startStr)
      const end = dayjs(endStr).add(1, 'hour')

      while (start.isBefore(end)) {
        booked[start.format('YYYY-MM-DDTHH:00:00')] = true
        start = start.add(1, 'hour')
      }
    })

    // Handle custom pricing ranges
    const customPricing = {}
    this.opts.customPricing.forEach(customStr => {
      // customStr will look like `2019-03-01T01:00:00/2019-03-05T02:00:00~0.6`
      const [range, price] = customStr.split('~')
      const [startStr, endStr] = range.split('/')
      let start = dayjs(startStr)
      // We have to add one to include the final hour in range
      const end = dayjs(endStr).add(1, 'hour')

      // Iterate over all hours between `start` and `end`
      while (start.isBefore(end)) {
        customPricing[start.format('YYYY-MM-DDTHH:00:00')] = price
        start = start.add(1, 'hour')
      }
    })

    // Iterate over all hours between `start` and `end`
    while (start.isBefore(end)) {
      const hour = start.format('YYYY-MM-DDTHH:00:00')

      let price = this.opts.price
      let isWorkingHour = false
      if (this.opts.workingHours[start.day()]) {
        const [startString, endString] = this.opts.workingHours[
            start.day()
          ].split('/'),
          // `.slice(0, 2)` gets the hour portion of the time, which is all we care about. E.g. '09'
          workingHourStart = start
            .startOf('day')
            .add(parseInt(startString.slice(0, 2)), 'hour'),
          workingHourEnd = start
            .startOf('day')
            .add(parseInt(endString.slice(0, 2)), 'hour')
        // `[`=inclusive of start, `)`=exclusive of end.
        isWorkingHour = start.isBetween(
          workingHourStart,
          workingHourEnd,
          null,
          '[)'
        )
      } else {
        // If no hours defined, default to no
        isWorkingHour = false
      }

      if (customPricing[hour]) {
        price = customPricing[hour]
      }

      hours.push({
        hour,
        nonWorkingHour: isWorkingHour ? false : true,
        unavailable: unavailable[hour] || booked[hour] ? true : false,
        booked: booked[hour] ? true : false,
        price,
        customPrice: customPricing[hour] ? true : false
      })
      start = start.add(1, 'hour')
    }

    return hours
  }
}

// const instance = new AvailabilityCalculator({
//   weekdayPrice: '0.5',
//   weekendPrice: '0.75',
//   advanceNotice: 0, // Number of days of advanced notice
//   bookingWindow: 180, // Book up to this many days in the future
//   unavailable: ['2019/02/01-2019/02/07'],
//   booked: ['2019/02/16-2019/02/18'],
//   customPricing: ['2019/03/01-2019/03/05:0.6']
// })
//
// instance.getAvailability('2019-01-15', '2019-03-15').forEach(date => {
//   if (date.booked) {
//     console.log(`${date.date}: Booked`)
//   } else if (date.unavailable) {
//     console.log(`${date.date}: Unavailable`)
//   } else {
//     console.log(
//       `${date.date}: ${date.price} ETH${date.customPrice ? ' (custom)' : ''}`
//     )
//   }
// })

export default AvailabilityCalculatorHourly
