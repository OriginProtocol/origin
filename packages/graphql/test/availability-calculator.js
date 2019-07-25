import assert from 'assert'
import dayjs from 'dayjs'

import AvailabilityCalculator from '../src/utils/AvailabilityCalculator'

describe('Availability Calculator', function() {
  const year = dayjs().year() + 1
  let instance

  beforeEach(() => {
    instance = new AvailabilityCalculator({
      weekdayPrice: '0.5',
      weekendPrice: '0.75',
      advanceNotice: 0, // Number of days of advanced notice
      bookingWindow: 180 // Book up to this many days in the future
    })
  })

  it('should allow a range of dates to be queried', function() {
    const dates = instance.getAvailability(`${year}-02-16`, `${year}-02-19`)

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

  it('should allow a custom price to be set to a range of dates', function() {
    const dates = instance.update(
      `${year}-02-01/${year}-02-04`,
      'available',
      '1.5'
    )
    assert.deepEqual(dates, [
      {
        date: `${year}-02-01`,
        unavailable: false,
        booked: false,
        price: '1.5',
        customPrice: true
      },
      {
        date: `${year}-02-02`,
        unavailable: false,
        booked: false,
        price: '1.5',
        customPrice: true
      },
      {
        date: `${year}-02-03`,
        unavailable: false,
        booked: false,
        price: '1.5',
        customPrice: true
      },
      {
        date: `${year}-02-04`,
        unavailable: false,
        booked: false,
        price: '1.5',
        customPrice: true
      }
    ])
  })

  it('should allow different custom prices to be set over multiple range of dates', function() {
    const customPriceRange1 = instance.update(
      `${year}-02-02/${year}-02-04`,
      'available',
      '1'
    )
    assert.deepEqual(customPriceRange1, [
      {
        date: `${year}-02-02`,
        unavailable: false,
        booked: false,
        price: '1',
        customPrice: true
      },
      {
        date: `${year}-02-03`,
        unavailable: false,
        booked: false,
        price: '1',
        customPrice: true
      },
      {
        date: `${year}-02-04`,
        unavailable: false,
        booked: false,
        price: '1',
        customPrice: true
      }
    ])

    const customPriceRange2 = instance.update(
      `${year}-02-01/${year}-02-02`,
      'available',
      '0.85'
    )
    assert.deepEqual(customPriceRange2, [
      {
        date: `${year}-02-01`,
        unavailable: false,
        booked: false,
        price: '0.85',
        customPrice: true
      },
      {
        date: `${year}-02-02`,
        unavailable: false,
        booked: false,
        price: '0.85',
        customPrice: true
      }
    ])

    const customPriceRange3 = instance.update(
      `${year}-02-04/${year}-02-05`,
      'available',
      '1.25'
    )
    assert.deepEqual(customPriceRange3, [
      {
        date: `${year}-02-04`,
        unavailable: false,
        booked: false,
        price: '1.25',
        customPrice: true
      },
      {
        date: `${year}-02-05`,
        unavailable: false,
        booked: false,
        price: '1.25',
        customPrice: true
      }
    ])

    const dates = instance.getAvailability(`${year}-02-01`, `${year}-02-06`)
    assert.deepEqual(dates, [
      {
        date: `${year}-02-01`,
        unavailable: false,
        booked: false,
        price: '0.85',
        customPrice: true
      },
      {
        date: `${year}-02-02`,
        unavailable: false,
        booked: false,
        price: '0.85',
        customPrice: true
      },
      {
        date: `${year}-02-03`,
        unavailable: false,
        booked: false,
        price: '1',
        customPrice: true
      },
      {
        date: `${year}-02-04`,
        unavailable: false,
        booked: false,
        price: '1.25',
        customPrice: true
      },
      {
        date: `${year}-02-05`,
        unavailable: false,
        booked: false,
        price: '1.25',
        customPrice: true
      }
    ])
  })

  it('should estimate prices correctly for a given range', function() {
    instance = new AvailabilityCalculator({
      weekdayPrice: '0.5',
      weekendPrice: '0.5',
      advanceNotice: 0, // Number of days of advanced notice
      bookingWindow: 180 // Book up to this many days in the future
    })

    let price = instance.estimateNightlyPrice(`${year}-01-10/${year}-01-15`)
      .price

    assert.equal(price, 2.5)

    price = instance.estimateNightlyPrice(`${year}-01-10/${year}-01-11`).price

    assert.equal(price, 0.5)
  })
})
