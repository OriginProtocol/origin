import assert from 'assert'
import dayjs from 'dayjs'

import AvailabilityCalculator from '../src/utils/AvailabilityCalculator'

const getSequentialRangeOfDates = maxDays => {
  const randomMonth = Math.floor(Math.random() * 3)

  const datesObjs = new Array(maxDays).fill(0).map((_, index) => {
    return dayjs()
      .add(randomMonth, 'month')
      .add(index, 'day')
  })

  const formattedDates = datesObjs.map(d => d.format('YYYY-MM-DD'))

  return {
    datesObjs,
    formattedDates
  }
}

describe('Availability Calculator', function() {
  let instance

  beforeEach(() => {
    instance = new AvailabilityCalculator({
      weekdayPrice: '0.5',
      weekendPrice: '0.75',
      advanceNotice: 0, // Number of days of advanced notice
      bookingWindow: 180 // Book up to this many days in the future
    })
  })

  it('should allow a range of dates to be queried', () => {
    const { datesObjs, formattedDates } = getSequentialRangeOfDates(8)

    const dates = instance.getAvailability(formattedDates[0], formattedDates[7])

    const resultantObj = datesObjs.slice(0, 7).map((dateObj, index) => {
      return {
        date: formattedDates[index],
        unavailable: false,
        booked: false,
        price: dateObj.day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      }
    })

    assert.deepEqual(dates, resultantObj)
  })

  it('should allow a range of dates to be made unavailable', () => {
    const { datesObjs, formattedDates } = getSequentialRangeOfDates(2)

    const dates = instance.update(
      `${formattedDates[0]}/${formattedDates[1]}`,
      'unavailable'
    )
    assert.deepEqual(dates, [
      {
        date: formattedDates[0],
        unavailable: true,
        booked: false,
        price: datesObjs[0].day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      },
      {
        date: formattedDates[1],
        unavailable: true,
        booked: false,
        price: datesObjs[1].day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      }
    ])
  })

  it('should allow a range of dates to be made available', function() {
    const { datesObjs, formattedDates } = getSequentialRangeOfDates(2)

    // Make them unavailable
    instance.update(`${formattedDates[0]}/${formattedDates[1]}`, 'unavailable')

    // Make them available again
    const dates = instance.update(
      `${formattedDates[0]}/${formattedDates[1]}`,
      'available'
    )

    assert.deepEqual(dates, [
      {
        date: formattedDates[0],
        unavailable: false,
        booked: false,
        price: datesObjs[0].day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      },
      {
        date: formattedDates[1],
        unavailable: false,
        booked: false,
        price: datesObjs[1].day() >= 5 ? '0.75' : '0.5',
        customPrice: false
      }
    ])
  })

  it('should allow a custom price to be set to a range of dates', function() {
    const { datesObjs, formattedDates } = getSequentialRangeOfDates(8)

    const dates = instance.update(
      `${formattedDates[0]}/${formattedDates[6]}`,
      'available',
      '1.5'
    )

    const resultantObj = datesObjs.slice(0, 7).map((dateObj, index) => {
      return {
        date: formattedDates[index],
        unavailable: false,
        booked: false,
        price: '1.5',
        customPrice: true
      }
    })

    assert.deepEqual(dates, resultantObj)
  })

  it('should allow different custom prices to be set over multiple range of dates', function() {
    const { datesObjs, formattedDates } = getSequentialRangeOfDates(8)

    instance.update(
      `${formattedDates[1]}/${formattedDates[3]}`,
      'available',
      '5'
    )
    instance.update(
      `${formattedDates[0]}/${formattedDates[2]}`,
      'available',
      '2'
    )
    instance.update(
      `${formattedDates[4]}/${formattedDates[6]}`,
      'available',
      '4'
    )
    instance.update(
      `${formattedDates[2]}/${formattedDates[5]}`,
      'available',
      '3'
    )

    const dates = instance.getAvailability(formattedDates[0], formattedDates[7])

    const resultantObj = datesObjs.slice(0, 7).map((dateObj, index) => {
      let price = 5

      if (index === 0 || index === 1) {
        price = 2
      } else if (index === 6) {
        price = 4
      } else if (index >= 2 && index <= 5) {
        price = 3
      }

      return {
        date: formattedDates[index],
        unavailable: false,
        booked: false,
        price: String(price),
        customPrice: true
      }
    })

    assert.deepEqual(dates, resultantObj)
  })

  it('should estimate prices correctly for a given range', function() {
    instance = new AvailabilityCalculator({
      weekdayPrice: '0.5',
      weekendPrice: '0.5',
      advanceNotice: 0, // Number of days of advanced notice
      bookingWindow: 180 // Book up to this many days in the future
    })

    const { formattedDates } = getSequentialRangeOfDates(10)

    let price = instance.estimateNightlyPrice(
      `${formattedDates[0]}/${formattedDates[4]}`
    ).price

    assert.equal(price, 2)

    price = instance.estimateNightlyPrice(
      `${formattedDates[0]}/${formattedDates[9]}`
    ).price

    assert.equal(price, 4.5)
  })
})
