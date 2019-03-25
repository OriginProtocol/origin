import React, { Component } from 'react'
import pick from 'lodash/pick'

import withTokenBalance from 'hoc/withTokenBalance'

import Steps from 'components/Steps'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import Wallet from 'components/Wallet'
import CoinPrice from 'components/CoinPrice'

import { formInput, formFeedback } from 'utils/formHelpers'
import withWallet from 'hoc/withWallet'

const NoOgn = () => (
  <div className="no-ogn">
    <div>
      You have 0 <span>OGN</span> in your wallet.
    </div>
    <div>Once you acquire some OGN you will be able to boost your listing.</div>
    <div>
      <a href="/#/about/tokens" target="_blank" rel="noopener noreferrer">
        Learn More
      </a>
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

class Boost extends Component {
  constructor(props) {
    super(props)
    this.state = { ...props.listing, fields: Object.keys(props.listing) }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-step-3">
            <div className="wrap">
              <div className="step">{`Step ${this.props.step}`}</div>
              <div className="step-description">Boost your listing</div>
              <Steps steps={this.props.steps} step={this.props.step} />

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
                  this.renderBoostSlider()
                )}

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={this.props.prev}
                  >
                    Back
                  </Link>
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
              <a
                href="/#/about/payments"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderBoostSlider() {
    const level = BoostLevels.find(l => l[0] <= Number(this.state.boost))
    const isMulti = Number(this.state.quantity || 0) > 1
    const isFractional = this.props.__typename === 'fractional'

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    const boostRequired = Number(this.state.quantity) * Number(this.state.boost)
    const enoughBoost = boostRequired <= Number(this.state.boostLimit)

    return (
      <>
        <div className="boost-info">
          <h5>{`Boost Level${isMulti ? ' (per unit)' : ''}${
            isFractional ? ' (per night)' : ''
          }`}</h5>
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
          <a href="/#/about/tokens" target="_blank" rel="noopener noreferrer">
            Learn More
          </a>
        </div>

        {!isMulti && !isFractional ? null : (
          <div className="form-group boost-limit">
            <label>Boost Limit</label>
            <div className="d-flex">
              <div style={{ flex: 1, marginRight: '1rem' }}>
                <div className="with-symbol">
                  <input {...input('boostLimit')} />
                  <span className="ogn">OGN</span>
                </div>
              </div>
              <div style={{ flex: 1 }} />
            </div>
            {Feedback('price')}
            <div className="help-text price">
              Maximum amount that will be spent to boost this listing. Boosts
              are always in OGN, <b>USD is an estimate.</b>
            </div>
          </div>
        )}

        {enoughBoost || !isMulti ? null : (
          <div className="boost-totals">
            <div className="totals">
              <div>{`Total number of units: ${this.state.quantity}`}</div>
              <div>{`Total boost required: ${boostRequired}`}</div>
            </div>
            <div>
              Your boost cap is lower than the total amount needed to boost all
              your units. After the cap is reached, the remaining units will not
              be boosted.
            </div>
            <button className="btn btn-link">Get OGN</button>
          </div>
        )}
      </>
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

export default withWallet(withTokenBalance(Boost))
