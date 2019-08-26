import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash.get'

import { fetchEvents } from '@/actions/event'
import { getEvents, getError, getIsLoading } from '@/reducers/event'

const SessionTable = props => {
  useEffect(props.fetchEvents, [])

  const loginEvents = props.events.filter(e => e.action === 'LOGIN')

  if (props.isLoading) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <>
      <div className="row">
        <div className="col">
          <h2>Session History</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <table className="table mt-4 mb-4">
              <thead>
                <tr>
                  <th>IP</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loginEvents.length === 0 ? (
                  <tr>
                    <td className="table-empty-cell" colSpan="100%">
                      No session events found.
                    </td>
                  </tr>
                ) : (
                  loginEvents.map(event => (
                    <tr key={event.id}>
                      <td>{event.data.ip}</td>
                      <td>
                        {event.data.device.isDesktop ? 'Desktop' : 'Mobile'}
                      </td>
                      <td>{event.data.device.browser}</td>
                      <td>{get(event.data.location, 'countryName', null)}</td>
                      <td>{moment(event.createdAt).fromNow()}</td>
                      <td>
                        {moment(event.createdAt).diff(moment(), 'minutes') >
                        -30 ? (
                          <>
                            <div className="status-circle status-circle-success mr-2"></div>
                            Active
                          </>
                        ) : (
                          <>
                            <div className="status-circle mr-2"></div>Expired
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ event }) => {
  return {
    events: getEvents(event),
    isLoading: getIsLoading(event),
    error: getError(event)
  }
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
