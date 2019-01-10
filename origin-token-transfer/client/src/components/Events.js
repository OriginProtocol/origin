import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { Intent, Toaster } from '@blueprintjs/core'
import moment from 'moment'

import { setSessionEmail } from '../actions'
import NavBar from './NavBar'

function EventRow(props) {
  const { event } = props
  const createdAt = moment(event.createdAt).format('YYYY-MM-DD h:mm a')
  let action
  switch(event.action) {
    case 'login':
      action = 'Web login'
      break

    case 'grant/vest': {
      const amount = JSON.parse(event.data).amount
      const grantDate = moment(event.grant.grantedAt).format('YYYY-MM-DD')
      action = <span>Vested <strong>{amount} OGN</strong> from grant {grantDate}</span>
      break
    }

    case 'grant/transfer': {
      const { amount, to } = JSON.parse(event.data)
      action = <span>Transferred <strong>{amount} OGN </strong> to {to}</span>
      break
    }

    default:
      action = `Unknown: ${event.action}`
  }

  return (
    <tr>
      <td>{createdAt}</td>
      <td>{event.ip}</td>
      <td>{action}</td>
    </tr>
  )
}

class Events extends Component {
  constructor(props) {
    super(props)
    this.state = { events: [] }
  }

  componentDidMount() {
    this.refreshEvents()
  }

  refreshEvents = () => {
    fetch('/api/events', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            this.props.setSessionEmail(undefined)
            throw new Error(`error fetching events: ${response.statusText}`)
          }
          throw new Error(response.statusText)
        }
        // TODO: centralize this logic somewhere
        const email = response.headers.get('x-authenticated-email')
        this.props.setSessionEmail(email)
        return response
      })
      .then((response) => response.json())
      .then((events) => {
        this.setState({ ...this.state, events })
        console.log(events)
      })
      .catch(err => Toaster.create().show({
        message: `Error fetching events: ${err}`,
        intent: Intent.DANGER
      }))
  }

  render() {
    const { sessionEmail } = this.props
    const { events } = this.state
    console.log(this.props)
    return (
      <div>
        {/* TODO: make /login redirect back to this page after login */}
        {!sessionEmail && <Redirect to="/login" />}

        <NavBar email={sessionEmail} />

        <div id="events">
          <h1>Events</h1>

          <table className="bp3-html-table bp3-html-table-bordered bp3-html-table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>IP Address</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              { events && events.map(e => <EventRow event={e} key={e.id} />) }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    sessionEmail: state.sessionEmail
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setSessionEmail: email => dispatch(setSessionEmail(email))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Events)
