import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

// const instance = new AvailabilityCalculator({
//   weekdayPrice: '0.5',
//   weekendPrice: '0.75',
//   advanceNotice: 3, // Number of days of advanced notice
//   bookingWindow: 180, // Book up to this many days in the future
//   unavailable: ['2019-02-01/2019-02-07'],
//   booked: ['2019-02-16/2019-02-18'],
//   customPricing: ['2019-03-01/2019-03-05~0.6']
// })

// const Keys = ['unavailable', 'booked', 'customPricing']

class AvailabilityCalculator {
  constructor(opts) {
    this.opts = opts
    this.opts.unavailable = this.opts.unavailable || []
    this.opts.booked = this.opts.booked || []
    this.opts.customPricing = this.opts.customPricing || []
  }

  /**
   * @param range         Date range (eg 2019-01-01/2019-02-01)
   * @param availability  'available', 'unavailable', 'booked'
   * @param price         '0.1', 'reset'
   */
  update(range, availability, price) {
    // Get availabitilty for one year into the future
    const slots = this.getAvailability(dayjs(), dayjs().add(1, 'year'))
    const [startStr, endStr] = range.split('/')
    const start = dayjs(startStr).subtract(1, 'day'),
      end = dayjs(endStr).add(1, 'day')

    const modifiedSlots = []
    let bookedRange, unavailableRange, customPriceRange
    const newBooked = [],
      newUnavailable = [],
      newCustomPrice = []

    slots.forEach(slot => {
      // Apply slot transform
      if (dayjs(slot.date).isBetween(start, end)) {
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
          bookedRange = `${bookedRange.split('/')[0]}/${slot.date}`
        } else {
          bookedRange = `${slot.date}/${slot.date}`
        }
      } else if (bookedRange) {
        newBooked.push(bookedRange)
        bookedRange = ''
      }
      if (slot.unavailable) {
        if (unavailableRange) {
          unavailableRange = `${unavailableRange.split('/')[0]}/${slot.date}`
        } else {
          unavailableRange = `${slot.date}/${slot.date}`
        }
      } else if (unavailableRange) {
        newUnavailable.push(unavailableRange)
        unavailableRange = ''
      }

      if (slot.customPrice) {
        if (customPriceRange) {
          customPriceRange = `${customPriceRange.split('/')[0]}/${slot.date}:${
            slot.price
          }`
        } else {
          customPriceRange = `${slot.date}/${slot.date}:${slot.price}`
        }
      } else if (customPriceRange) {
        newCustomPrice.push(customPriceRange)
        customPriceRange = ''
      }

      return slot
    })

    this.opts.booked = newBooked
    this.opts.unavailable = newUnavailable.filter(a => newBooked.indexOf(a) < 0)
    this.opts.customPricing = newCustomPrice

    return modifiedSlots
  }

  estimatePrice(range) {
    const [startStr, endStr] = range.split('/')
    const availability = this.getAvailability(startStr, endStr)
    const available = availability.every(slot => slot.unavailable === false)
    const price = availability.reduce((m, slot) => m + Number(slot.price), 0)
    return { available, price: Math.round(price * 100000) / 100000 }
  }

  getAvailability(startStr, endStr) {
    // Get hourly availabilty between startStr and endStr
    let start = typeof startStr === 'string' ? dayjs(startStr) : startStr
    let end = typeof endStr === 'string' ? dayjs(endStr) : endStr
    const hours = []

    if (end.isBefore(start)) {
      const newEnd = start
      start = end
      end = newEnd
    }

    const customPricing = {}
    this.opts.customPricing.forEach(customStr => {
      // customStr will look like `2019-03-01T01:00:00/2019-03-05T02:00:00~0.6`
      const [range, price] = customStr.split('~')
      const [startStr, endStr] = range.split('/')
      let start = dayjs(startStr)
      const end = dayjs(endStr)

      // Iterate over all hours between `start` and `end`
      while (start.isBefore(end)) {
        customPricing[start.format('YYYY-MM-DDTHH:00:00')] = price
        start = start.add(1, 'hour')
      }
    })

    // Iterate over all hours between `start` and `end`
    while (start.isBefore(end)) {
      const hour = start.format('YYYY-MM-DDTHH:00:00')
      let price = 0
      if (customPricing[hour]) {
        price = customPricing[hour]
      }
      hours.push({
        hour,
        price,
        unavailable: customPricing[hour] ? false : true,
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

export default AvailabilityCalculator
