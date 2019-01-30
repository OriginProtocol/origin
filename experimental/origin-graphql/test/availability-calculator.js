import assert from 'assert'

import AvailabilityCalculator from '../src/utils/AvailabilityCalculator'

describe('Availability Calculator', function() {
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
    const dates = instance.getAvailability('2019/02/16', '2019/02/18')
    assert.deepEqual(dates, [
      {
        date: '2019/02/16',
        unavailable: false,
        booked: false,
        price: '0.75',
        customPrice: false
      },
      {
        date: '2019/02/17',
        unavailable: false,
        booked: false,
        price: '0.5',
        customPrice: false
      },
      {
        date: '2019/02/18',
        unavailable: false,
        booked: false,
        price: '0.5',
        customPrice: false
      }
    ])
  })

  it('should allow a range of dates to be made unavailable', function() {
    const dates = instance.update('2019/02/01-2019/02/02', 'unavailable')
    assert.deepEqual(dates, [
      {
        date: '2019/02/01',
        unavailable: true,
        booked: false,
        price: '0.75',
        customPrice: false
      },
      {
        date: '2019/02/02',
        unavailable: true,
        booked: false,
        price: '0.75',
        customPrice: false
      }
    ])
  })

  it('should allow a range of dates to be made available', function() {
    const dates = instance.update('2019/02/01-2019/02/02', 'available')
    assert.deepEqual(dates, [
      {
        date: '2019/02/01',
        unavailable: false,
        booked: false,
        price: '0.75',
        customPrice: false
      },
      {
        date: '2019/02/02',
        unavailable: false,
        booked: false,
        price: '0.75',
        customPrice: false
      }
    ])
  })
})
