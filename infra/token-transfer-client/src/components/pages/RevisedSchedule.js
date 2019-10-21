import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import UnlockSchedule from '@/assets/unlock-schedule.png'

class RevisedSchedule extends Component {
  state = {
    redirectTo: null
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card wide">
          <h1>Revised Token Unlock Schedule</h1>
          <p>
            As we mentioned previously, we’ve also reached an agreement with our
            listing exchanges to start distributing our tokens. As a necessary
            part of this agreement our token unlock schedule has been revised.
          </p>
          <p>
            Original Schedule: 3 month waiting period then 100% unlock
            <br />
            Revised Schedule: 4% unlock immediately then 12% every 3 months
          </p>
          <img className="img-fluid my-4" src={UnlockSchedule} />
          <h2 className="mb-3">Why is this necessary?</h2>
          <p>
            This has been done in order to benefit you, the investor, as well as
            the overall health of the OGN token. We seek to avoid individuals
            receiving their full token amount and cashing out right away thereby
            hurting the value of the token and all the other investors who
            choose to hold.
          </p>
          <p>
            Questions?{' '}
            <a href="mailto:investors@originprotocol.com">
              Contact Origin Investor Services
            </a>
          </p>
          <button
            className="btn btn-secondary btn-lg mt-5"
            onClick={() => this.setState({ redirectTo: '/revised_terms' })}
          >
            View Agreement
          </button>
        </div>
      </>
    )
  }
}

export default RevisedSchedule
