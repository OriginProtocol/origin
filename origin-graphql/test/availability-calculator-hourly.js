import assert from 'assert'
import dayjs from 'dayjs'

import AvailabilityCalculatorHourly from '../src/utils/AvailabilityCalculatorHourly'

describe('Hourly Availability Calculator ', function() {
  const year = dayjs().year() + 1
  let instance

  it('should allow a new instance', function() {
    instance = new AvailabilityCalculatorHourly({
      // weekdayPrice: '0.5',
      // weekendPrice: '0.75',
      // advanceNotice: 0, // Number of days of advanced notice
      // bookingWindow: 180 // Book up to this many days in the future
    })
  })

  it('should allow a range of datetimes to be queried', function() {
    const dates = instance.getAvailability(
      `${year}-02-16T01:00:00`,
      `${year}-02-16T03:00:00`
    )
    assert.deepEqual(dates, [
      {
        hour: `${year}-02-16T01:00:00`,
        unavailable: true,
        booked: false,
        price: 0,
        customPrice: false
      },
      {
        hour: `${year}-02-16T02:00:00`,
        unavailable: true,
        booked: false,
        price: 0,
        customPrice: false
      },
      {
        hour: `${year}-02-16T03:00:00`,
        unavailable: true,
        booked: false,
        price: 0,
        customPrice: false
      }
    ])
  })

  it('should allow a range of datetimes to be made unavailable', function() {
    const dates = instance.update(
      `${year}-02-01T03:00:00/${year}-02-01T05:00:00`,
      'unavailable'
    )
    assert.deepEqual(dates, [
      {
        hour: `${year}-02-01T03:00:00`,
        unavailable: true,
        booked: false,
        price: 0,
        customPrice: false
      },
      {
        hour: `${year}-02-01T04:00:00`,
        unavailable: true,
        booked: false,
        price: 0,
        customPrice: false
      }
    ])
  })

  it('should allow a range of datetimes to be made available', function() {
    const dates = instance.update(
      `${year}-02-01T04:00:00/${year}-02-01T06:00:00`,
      'available'
    )
    assert.deepEqual(dates, [
      {
        hour: `${year}-02-01T04:00:00`,
        unavailable: false,
        booked: false,
        price: 0,
        customPrice: false
      },
      {
        hour: `${year}-02-01T05:00:00`,
        unavailable: false,
        booked: false,
        price: 0,
        customPrice: false
      }
    ])
  })
})
