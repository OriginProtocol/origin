import assert from 'assert'
import dayjs from 'dayjs'

import AvailabilityCalculatorHourly from '../src/utils/AvailabilityCalculatorHourly'

describe('Hourly Availability Calculator ', function() {
  const year = '2020' // Fixed year so day of week doesn't change
  let instance

  it('should allow a new instance', function() {
    instance = new AvailabilityCalculatorHourly({
      price: 0.99,
      timeZone: 'Europe/Berlin',
      customPricing: [],
      unavailable: [],
      booked: [],
      workingHours: [
        '',
        '09:00:00/17:00:00',
        '',
        '09:00:00/17:00:00',
        '09:00:00/17:00:00',
        '09:00:00/17:00:00',
        ''
      ]
    })
  })

  it('should allow a range of datetimes to be queried', function() {
    const dates = instance.getAvailability(
      `${year}-02-12T09:00:00`,
      `${year}-02-12T12:00:00`
    )
    assert.deepEqual(dates, [
      {
        hour: `${year}-02-12T09:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      },
      {
        hour: `${year}-02-12T10:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      },
      {
        hour: `${year}-02-12T11:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      },
      {
        hour: `${year}-02-12T12:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      }
    ])
  })

  it('should allow a range of datetimes to be made unavailable', function() {
    const dates = instance.update(
      `${year}-02-12T12:00:00/${year}-02-12T14:00:00`,
      'unavailable'
    )
    assert.deepEqual(dates, [
      {
        hour: `${year}-02-12T12:00:00`,
        unavailable: true,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      },
      {
        hour: `${year}-02-12T13:00:00`,
        unavailable: true,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      }
    ])
  })

  it('should allow a range of datetimes to be made available', function() {
    const dates = instance.update(
      `${year}-02-12T14:00:00/${year}-02-12T16:00:00`,
      'available'
    )
    assert.deepEqual(dates, [
      {
        hour: `${year}-02-12T14:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      },
      {
        hour: `${year}-02-12T15:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      }
    ])
  })
})
