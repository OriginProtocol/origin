import assert from 'assert'
import dayjs from 'dayjs'

import AvailabilityCalculatorHourly from '../src/utils/AvailabilityCalculatorHourly'

const rangeToTimeString = (date, startHour, endHour) => {
  const range = endHour - startHour + 1

  const formattedDate = date.format('YYYY-MM-DD')

  return new Array(range).fill(0).map((_, index) => {
    const paddedHour = (startHour + index).toString().padStart(2, '0')
    return `${formattedDate}T${paddedHour}:00:00`
  })
}

let randomDateObj

describe('Hourly Availability Calculator ', function() {
  let instance

  it('should allow a new instance', function() {
    const randomMonth = Math.floor(Math.random() * 3)

    randomDateObj = dayjs().add(randomMonth, 'month')

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
    const startHour = 9
    const endHour = 12

    const timeRange = rangeToTimeString(randomDateObj, startHour, endHour)

    const availability = instance.getAvailability(
      timeRange[0],
      timeRange[timeRange.length - 1]
    )

    const resultantObj = timeRange.map(hour => {
      return {
        hour: hour,
        unavailable: [0, 2, 6].includes(randomDateObj.day()),
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      }
    })

    assert.deepEqual(availability, resultantObj)
  })

  it('should allow a range of datetimes to be made unavailable', function() {
    const formattedDate = randomDateObj.format('YYYY-MM-DD')

    const dates = instance.update(
      `${formattedDate}T12:00:00/${formattedDate}T14:00:00`,
      'unavailable'
    )
    assert.deepEqual(dates, [
      {
        hour: `${formattedDate}T12:00:00`,
        unavailable: true,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      },
      {
        hour: `${formattedDate}T13:00:00`,
        unavailable: true,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      }
    ])
  })

  it('should allow a range of datetimes to be made available', function() {
    const formattedDate = randomDateObj.format('YYYY-MM-DD')

    const dates = instance.update(
      `${formattedDate}T14:00:00/${formattedDate}T16:00:00`,
      'available'
    )
    assert.deepEqual(dates, [
      {
        hour: `${formattedDate}T14:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      },
      {
        hour: `${formattedDate}T15:00:00`,
        unavailable: false,
        booked: false,
        price: 0.99,
        customPrice: false,
        nonWorkingHour: false
      }
    ])
  })
})
