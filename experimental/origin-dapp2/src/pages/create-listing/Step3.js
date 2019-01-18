import React, { Component } from 'react'
import pick from 'lodash/pick'

import Steps from 'components/Steps'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import Wallet from 'components/Wallet'
import CoinPrice from 'components/CoinPrice'

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

const BoostLevels = [
  [76, 'premium', 'Premium', 'Your listing will get the best visibility.'],
  [51, 'high', 'High', 'Your listing will get above-average visibility.'],
  [
    26,
    'med',
    'Medium (recommended)',
    'Your listing will get average visibility.'
  ],
  [1, 'low', 'Low', 'Your listing will get below-average visibility.'],
  [0, 'none', 'None', 'Your listing will get very low visibility.']
]

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

    const level = BoostLevels.find(l => l[0] <= Number(this.state.boost))

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

                {this.props.tokenBalance === 0 ? (
                  <NoOgn />
                ) : (
                  <>
                    <div className="boost-info">
                      <h5>Boost Level</h5>
                      <i />
                    </div>
                    <div className={`boost-value ${level[1]}`}>
                      <div className="description">{level[2]}</div>
                      <CoinPrice price={this.state.boost} coin="ogn" />
                    </div>

                    <div className={`form-group slider ${level[1]}`}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={this.state.boost}
                        onChange={e => this.setState({ boost: e.target.value })}
                      />
                    </div>

                    <div className="boost-description">{level[3]}</div>

                    <div className="info">
                      {'Boosts are always calculated and charged in OGN. '}
                      <Link to="/about-tokens">Learn more</Link>
                    </div>
                  </>
                )}

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
      margin-bottom: 2rem
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

    .boost-info
      h5
        color: var(--dusk)
        font-size: 18px
        margin-bottom: 0.25rem
      > div
        color: var(--bluey-grey)
        font-size: 14px
        font-weight: normal
    .boost-value
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: normal
      .description::before
        content: ""
        display: inline-block
        border: 1px dashed transparent
        width: 1.25rem
        height: 1.25rem
        border-radius: 3px;
        vertical-align: sub
        margin-right: 0.5rem
        background: url(images/boost-icon-arrow.svg) no-repeat center
      &.none .description::before
        border: 1px dashed var(--bluey-grey)
      &.low .description::before
        background-color: var(--bluey-grey)
      &.med .description::before
        background-color: var(--steel)
      &.high .description::before
        background-color: var(--dusk)
      &.premium .description::before
        background-color: var(--golden-rod)

    .boost-description
      text-align: center
      font-style: italic
      font-weight: normal
      margin-bottom: 2rem
    .info
      color: var(--bluey-grey);
      font-weight: normal;
      font-size: 14px;
      text-align: center;

    .slider
      input
        width: 100%
        -webkit-appearance: none
        height: 20px
        border-radius: 10px
        background: #d3d3d3
        outline: none
        overflow: hidden
        box-shadow: inset 0px 0px 1px var(--dark)

        &::-webkit-slider-thumb
          -webkit-appearance: none
          appearance: none
          width: 20px
          height: 20px
          border-radius: 50%
          background: var(--white)
          border: 1px solid var(--dusk)
          cursor: pointer;
          box-shadow: -1000px 0 0 990px var(--golden-rod)

      &.none input::-webkit-slider-thumb
        box-shadow: -1000px 0 0 990px var(--boost-low)
      &.low input::-webkit-slider-thumb
        box-shadow: -1000px 0 0 990px var(--boost-low)
      &.med input::-webkit-slider-thumb
        box-shadow: -1000px 0 0 990px var(--boost-medium)
      &.high input::-webkit-slider-thumb
        box-shadow: -1000px 0 0 990px var(--boost-high)
      &.premium input::-webkit-slider-thumb
        box-shadow: -1000px 0 0 990px var(--boost-premium)

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
