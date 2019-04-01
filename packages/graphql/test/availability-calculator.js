import assert from 'assert'
import dayjs from 'dayjs'

import AvailabilityCalculator from '../src/utils/AvailabilityCalculator'

describe('Availability Calculator', function() {
  const year = dayjs().year() + 1
  let instance

  it('should allow a new instance', function() {
    instance = new AvailabilityCalculator({
      weekdayPrice: '0.5',
      weekendPrice: '0.75',
      advanceNotice: 0, // Number of days of advanced notice
      bookingWindow: 180 // Book up to this many days in the future
    })
  })

  it('should allow a range of dates to be queried', function() {
    const dates = instance.getAvailability(`${year}-02-16`, `${year}-02-18`)
    assert.deepEqual(dates, [
      {
        date: `${year}-02-16`,
        unavailable: false,
        booked: false,
        price: dayjs(`${year}-02-16`).day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      },
      {
        date: `${year}-02-17`,
        unavailable: false,
        booked: false,
        price: dayjs(`${year}-02-17`).day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      },
      {
        date: `${year}-02-18`,
        unavailable: false,
        booked: false,
        price: dayjs(`${year}-02-18`).day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      }
    ])
  })

  it('should allow a range of dates to be made unavailable', function() {
    const dates = instance.update(`${year}-02-01/${year}-02-02`, 'unavailable')
    assert.deepEqual(dates, [
      {
        date: `${year}-02-01`,
        unavailable: true,
        booked: false,
        price: dayjs(`${year}-02-01`).day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      },
      {
        date: `${year}-02-02`,
        unavailable: true,
        booked: false,
        price: dayjs(`${year}-02-02`).day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      }
    ])
  })

  it('should allow a range of dates to be made available', function() {
    const dates = instance.update(`${year}-02-01/${year}-02-02`, 'available')
    assert.deepEqual(dates, [
      {
        date: `${year}-02-01`,
        unavailable: false,
        booked: false,
        price: dayjs(`${year}-02-01`).day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      },
      {
        date: `${year}-02-02`,
        unavailable: false,
        booked: false,
        price: dayjs(`${year}-02-02`).day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      }
    ])
  })
})
