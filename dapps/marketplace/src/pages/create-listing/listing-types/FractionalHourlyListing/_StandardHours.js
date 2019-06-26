import React from 'react'
import { fbt } from 'fbt-runtime'

const defaultWorkingHoursDay = '09:00:00/17:00:00'

// For i18n, we'll need to customize how hours are shown
const workingHoursSelect = [
  ['00:00:00', '12am'],
  ['01:00:00', '1am'],
  ['02:00:00', '2am'],
  ['03:00:00', '3am'],
  ['04:00:00', '4am'],
  ['05:00:00', '5am'],
  ['06:00:00', '6am'],
  ['07:00:00', '7am'],
  ['08:00:00', '8am'],
  ['09:00:00', '9am'],
  ['10:00:00', '10am'],
  ['11:00:00', '11am'],
  ['12:00:00', '12pm'],
  ['13:00:00', '1pm'],
  ['14:00:00', '2pm'],
  ['15:00:00', '3pm'],
  ['16:00:00', '4pm'],
  ['17:00:00', '5pm'],
  ['18:00:00', '6pm'],
  ['19:00:00', '7pm'],
  ['20:00:00', '8pm'],
  ['21:00:00', '9pm'],
  ['22:00:00', '10pm'],
  ['23:00:00', '11pm']
]

const FractionalStandardHours = ({ workingHours, onChange }) => (
  <>
    {[
      fbt('Sunday', 'Sunday'),
      fbt('Monday', 'Monday'),
      fbt('Tuesday', 'Tuesday'),
      fbt('Wednesday', 'Wednesday'),
      fbt('Thursday', 'Thursday'),
      fbt('Friday', 'Friday'),
      fbt('Saturday', 'Saturday')
    ].map((dayName, dayIndex) => (
      <div className="d-flex" key={dayIndex}>
        <div style={{ height: '3.0rem' }}>
          <input
            type="checkbox"
            style={{ marginRight: '1rem' }}
            checked={
              workingHours.length > 0 &&
              workingHours[dayIndex].indexOf('/') > -1
            }
            onChange={() => {
              const newWorkingHours = [...workingHours]
              newWorkingHours[dayIndex] = newWorkingHours[dayIndex]
                ? (newWorkingHours[dayIndex] = '')
                : (newWorkingHours[dayIndex] = defaultWorkingHoursDay)
              onChange(newWorkingHours)
            }}
          />
        </div>
        <div className="mr-2" style={{ flex: 1 }}>
          <div>{dayName}</div>
        </div>
        <div className="mr-2" style={{ flex: 1 }}>
          {workingHours[dayIndex] && (
            <select
              className="form-control"
              value={workingHours[dayIndex].split('/')[0]}
              onChange={e => {
                const newWorkingHours = [...workingHours]
                newWorkingHours[dayIndex] =
                  e.target.value + '/' + workingHours[dayIndex].split('/')[1]
                onChange(newWorkingHours)
              }}
            >
              {workingHoursSelect.map(([id, display]) => (
                <option
                  key={id}
                  value={id}
                  disabled={
                    // Disable hours after end time
                    id >= workingHours[dayIndex].split('/')[1]
                  }
                >
                  {display}
                </option>
              ))}
            </select>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {workingHours[dayIndex] && (
            <select
              className="form-control"
              value={workingHours[dayIndex].split('/')[1]}
              onChange={e => {
                const newWorkingHours = [...workingHours]
                newWorkingHours[dayIndex] =
                  workingHours[dayIndex].split('/')[0] + '/' + e.target.value
                onChange(newWorkingHours)
              }}
            >
              {workingHoursSelect.map(([id, display]) => (
                <option
                  key={id}
                  value={id}
                  disabled={
                    // Disable hours before start time
                    id <= workingHours[dayIndex].split('/')[0]
                  }
                >
                  {display}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    ))}
  </>
)

export default FractionalStandardHours
