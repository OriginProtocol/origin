import React, { Component } from 'react'
import pick from 'lodash/pick'

import Steps from 'components/Steps'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import Wallet from 'components/Wallet'

import { formInput, formFeedback } from 'utils/formHelpers'

const NoOgn = () => (
  <div className="no-ogn">
    <div>
      You have 0 <span>OGN</span> in your wallet.
    </div>
    <div>Once you acquire some OGN you will be able to boost your listing.</div>
    <div>
      <Link to="/">Learn More</Link>
    </div>
  </div>
)

class Step2 extends Component {
  constructor(props) {
    super(props)
    this.state = { ...props.listing, fields: Object.keys(props.listing) }
  }

  render() {
    const isEdit = this.props.mode === 'edit'
    const prefix = isEdit ? `/listings/${this.props.listingId}/edit` : '/create'

    if (this.state.valid) {
      return <Redirect to={`${prefix}/review`} push />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-step-3">
            <div className="wrap">
              <div className="step">Step 3</div>
              <div className="step-description">Boost your listing</div>
              <Steps steps={3} step={3} />

              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.validate()
                }}
              >
                <div className="help-text">
                  You can boost your listing to get higher visibility in the
                  Origin DApp. More buyers will see your listing, which
                  increases the chances of a fast and successful sale.
                </div>

                <NoOgn />

                <div className="form-group slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={this.state.boost}
                    onChange={e => this.setState({ boost: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>
                    {isEdit ? 'Additional Boost' : 'Boost Level (per unit)'}
                  </label>
                  <input
                    {...input('boost')}
                    placeholder="OGN to Boost your listing"
                  />
                  {Feedback('boost')}
                </div>

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={`${prefix}/step-2`}
                    children="Back"
                  />
                  <button type="submit" className="btn btn-primary">
                    Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <Wallet />
          <div className="gray-box">
            <h5>About Visibility</h5>
            Origin sorts and displays listings based on relevance, recency, and
            boost level. Higher-visibility listings are shown to buyers more
            often.
            <h5 className="mt-3">Origin Tokens</h5>
            OGN is an ERC-20 token used for incentives and governance on the
            Origin platform. Future intended uses of OGN might include referral
            rewards, reputation incentives, spam prevention, developer rewards,
            and platform governance.
            <div className="mt-3">
              <Link to="/about-tokens">Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.boost) {
      newState.boostError = 'Boost is required'
    } else if (!this.state.boost.match(/^-?[0-9.]+$/)) {
      newState.boostError = 'Boost must be a number'
    } else if (Number(this.state.boost) < 0) {
      newState.boostError = 'Boost must be zero or greater'
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange(pick(this.state, this.state.fields))
    }
    this.setState(newState)
    return newState.valid
  }
}

export default Step2

require('react-styl')(`
  .create-listing .create-listing-step-3
    max-width: 460px
    .help-text
      font-size: 16px
      margin-bottom: 1rem
    .no-ogn
      border: 1px solid var(--golden-rod)
      padding: 7rem 2rem 2rem 2rem
      border-radius: 5px
      text-align: center
      background: var(--golden-rod-light) url(images/ogn-icon-horiz.svg) no-repeat
      background-position: center 2rem
      margin-bottom: 1rem
      > div:nth-child(1)
        font-weight: bold
        margin-bottom: 0.5rem
        > span
          color: #007bff
      > div:nth-child(2)
        margin-bottom: 0.5rem
      > div:nth-child(3)
        font-weight: bold

    .slider input
      width: 100%
      -webkit-appearance: none
      height: 20px
      border-radius: 10px
      background: #d3d3d3
      outline: none
      overflow: hidden
      border: 1px solid var(--bluey-grey)

      &::-webkit-slider-thumb
        -webkit-appearance: none
        appearance: none
        width: 18px
        height: 18px
        border-radius: 50%
        background: var(--white)
        border: 1px solid var(--dusk)
        cursor: pointer;
        box-shadow: -1000px 0 0 990px var(--golden-rod)

    .actions
      margin-top: 2.5rem
      display: flex
      justify-content: space-between
      .btn
        min-width: 10rem
        border-radius: 2rem
        padding: 0.625rem
        font-size: 18px
`)
