import React, { Component } from 'react'

const keyMap = {
  'firstName': {
    publiclyVisible: true,
    value: 'First Name',
  },
  'lastName': {
    publiclyVisible: true,
    value: 'Last Name',
  },
  'description': {
    publiclyVisible: true,
    value: 'Description',
  },
  'pic': {
    publiclyVisible: true,
    value: 'Picture',
  },
  'phone': {
    publiclyVisible: false,
    value: 'Phone Number',
  },
  'email': {
    publiclyVisible: false,
    value: 'Email Address',
  },
  'address': {
    publiclyVisible: false,
    value: 'Mailing Address',
  },
  'facebook': {
    publiclyVisible: false,
    value: 'Facebook'
  },
  'twitter': {
    publiclyVisible: false,
    value: 'Twitter',
  },
  'google': {
    publiclyVisible: false,
    value: 'Google',
  },
}

class ProvisionedChanges extends Component {
  render() {
    const mappedChanges = this.props.changes.map(c => keyMap[c])
    const publiclyVisibleChanges = mappedChanges.filter(c => c.publiclyVisible)
    const attestationChanges = mappedChanges.filter(c => !c.publiclyVisible)

    return (
      <div className="d-flex justify-content-center">
        {!!publiclyVisibleChanges.length &&
          <ul>
            {publiclyVisibleChanges.map(({ value }, i) => (
              <li key={`${value}~${i}`}>{value}</li>
            ))}
          </ul>
        }
        {!!attestationChanges.length &&
          <ul>
            {attestationChanges.map(({ value }, i) => (
              <li key={`${value}~${i}`}>{value}</li>
            ))}
          </ul>
        }
      </div>
    )
  }
}

export default ProvisionedChanges
