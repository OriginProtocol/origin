import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { fetchEvents } from '@/actions/event'

const SessionTable = props => {
  useEffect(props.fetchEvents, [])

  return (
    <>
      <div className="row">
        <div className="col">
          <h2>Session History</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <table className="table mt-4 mb-4">
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Device</th>
                <th>Browser</th>
                <th>Location</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {props.event.events.length === 0 ? (
                <tr>
                  <td className="table-empty-cell" colSpan="100%">
                    No session events found.
                  </td>
                </tr>
              ) : (
                props.event.events
                  .filter(event => event.action === 'LOGIN')
                  .map(event => (
                    <tr key={event.id}>
                      <td>{event.ip}</td>
                      <td>
                        {event.data.device.isDesktop ? 'Desktop' : 'Mobile'}
                      </td>
                      <td>{event.data.device.browser}</td>
                      <td>{event.data.location}</td>
                      <td>{moment(event.createdAt).fromNow()}</td>
                      <td>
                        {moment(event.createdAt).diff(moment(), 'minutes') > -30
                          ? 'Active'
                          : 'Expired'}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ event }) => {
  return { event }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchEvents: fetchEvents
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SessionTable)
