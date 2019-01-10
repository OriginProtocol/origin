import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import GrantsTable from './GrantsTable'
import NavBar from './NavBar'

import { setGrants, setSessionEmail } from '../actions'

class Grants extends Component {
  refreshGrants = () => {
    fetch('/api/grants', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            this.props.setSessionEmail(undefined)
            throw new Error(`error fetching grants: ${response.statusText}`)
          }
          throw new Error(response.statusText)
        }
        const email = response.headers.get('x-authenticated-email')
        this.props.setSessionEmail(email)
        return response
      })
      .then((response) => response.json())
      .then((grants) => this.props.setGrants(grants))
      .catch(err => console.error(err)) // TODO: replace with some alert
  }

  componentDidMount() {
    this.refreshGrants()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.grantsVersion !== this.props.grantsVersion) {
      this.refreshGrants()
    }
  }

  render() {
    const { sessionEmail } = this.props
    return (
      <div>
        {!sessionEmail && <Redirect to="/login" />}
        <NavBar email={sessionEmail} />

        <div id="grants">
          <h1>Your Token Grants</h1>
          <GrantsTable />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    grantsVersion: state.grantsVersion,
    sessionEmail: state.sessionEmail
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setGrants: grants => dispatch(setGrants(grants)),
    setSessionEmail: email => dispatch(setSessionEmail(email))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Grants)
