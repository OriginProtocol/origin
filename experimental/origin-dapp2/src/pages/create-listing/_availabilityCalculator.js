import dayjs from 'dayjs'

class AvailabilityCalculator {
  constructor(opts) {
    this.opts = opts
    console.log(opts)
  }

  // update(start, end, available,)

  getAvailability(startStr, endStr) {
    let start = dayjs(startStr)
    const end = dayjs(endStr),
      days = []

    if (end.isBefore(start)) {
      throw new Error('End is before start')
    }

    const unavailable = {}
    this.opts.unavailable.forEach(range => {
      const [startStr, endStr] = range.split('-')
      let start = dayjs(startStr)
      const end = dayjs(endStr)

      while(start.isBefore(end)) {
        unavailable[start.format('YYYY/MM/DD')] = true
        start = start.add(1, 'day')
      }
    })

    const booked = {}
    this.opts.booked.forEach(range => {
      const [startStr, endStr] = range.split('-')
      let start = dayjs(startStr)
      const end = dayjs(endStr)

      while(start.isBefore(end)) {
        booked[start.format('YYYY/MM/DD')] = true
        start = start.add(1, 'day')
      }
    })

    const customPricing = {}
    this.opts.customPricing.forEach(customStr => {
      const [range, price] = customStr.split(':')
      const [startStr, endStr] = range.split('-')
      let start = dayjs(startStr)
      const end = dayjs(endStr)

      while(start.isBefore(end)) {
        customPricing[start.format('YYYY/MM/DD')] = price
        start = start.add(1, 'day')
      }
    })

    while(start.isBefore(end)) {
      const date = start.format('YYYY/MM/DD')
      let price = this.opts.weekdayPrice
      if (customPricing[date]) {
        price = customPricing[date]
      } else if (start.day() >= 5) {
        price = this.opts.weekendPrice
      }
      days.push({
        date,
        unavailable: unavailable[date] || booked[date] ? true : false,
        booked: booked[date] ? true : false,
        price,
        customPrice: customPricing[date] ? true : false
      })
      start = start.add(1, 'day')
    }

    return days
  }
}

const instance = new AvailabilityCalculator({
  weekdayPrice: '0.5',
  weekendPrice: '0.75',
  advanceNotice: 0, // Number of days of advanced notice
  bookingWindow: 180, // Book up to this many days in the future
  unavailable: ['2019/02/01-2019/02/07'],
  booked: ['2019/02/16-2019/02/18'],
  customPricing: ['2019/03/01-2019/03/05:0.6']
})

instance.getAvailability('2019-01-15', '2019-03-15').forEach(date => {
  if (date.booked) {
    console.log(`${date.date}: Booked`)
  } else if (date.unavailable) {
    console.log(`${date.date}: Unavailable`)
  } else {
    console.log(`${date.date}: ${date.price} ETH${date.customPrice ? ' (custom)' : ''}`)
  }
})

// export default instance
