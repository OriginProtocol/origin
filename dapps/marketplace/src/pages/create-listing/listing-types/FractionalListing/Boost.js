import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import pick from 'lodash/pick'

import withTokenBalance from 'hoc/withTokenBalance'

import Steps from 'components/Steps'
import Link from 'components/Link'
import Redirect from 'components/Redirect'
import Wallet from 'components/Wallet'
import CoinPrice from 'components/CoinPrice'

import { formInput, formFeedback } from 'utils/formHelpers'
import withWallet from 'hoc/withWallet'

const NoOgn = () => (
  <div className="no-ogn">
    <fbt desc="create.boost.no-ogn">
      <div>
        You have 0 <span>OGN</span> in your wallet.
      </div>
      <div>
        Once you acquire some OGN you will be able to boost your listing.
      </div>
      <div>
        <Link to="/about/tokens">Learn More</Link>
      </div>
    </fbt>
  </div>
)

const BoostLevels = [
  [
    76,
    'premium',
    fbt('Premium', 'create.boost.Premium'),
    fbt(
      'Your listing will get the best visibility.',
      'create.boost.best visibility.'
    )
  ],
  [
    51,
    'high',
    fbt('High', 'create.boost.High'),
    fbt(
      'Your listing will get above-average visibility.',
      'create.boost.above-average.'
    )
  ],
  [
    26,
    'med',
    fbt('Medium (recommended)', 'create.boost.Medium'),
    fbt('Your listing will get average visibility.', 'create.boost.average.')
  ],
  [
    1,
    'low',
    fbt('Low', 'create.boost.Low'),
    fbt(
      'Your listing will get below-average visibility.',
      'create.boost.below-average'
    )
  ],
  [
    0,
    'none',
    fbt('None', 'create.boost.None'),
    fbt('Your listing will get very low visibility.', 'create.boost.very-low')
  ]
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
                    Continue
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

  renderBoostSlider() {
    const level = BoostLevels.find(l => l[0] <= Number(this.state.boost))

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        <div className="boost-info">
          <h5>Boost Level (per night)</h5>
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
            Maximum amount that will be spent to boost this listing. Boosts are
            always in OGN, <b>USD is an estimate.</b>
          </div>
        </div>
      </>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.boost) {
      newState.boostError = fbt('Boost is required', 'Boost is required')
    } else if (!this.state.boost.match(/^-?[0-9.]+$/)) {
      newState.boostError = fbt(
        'Boost must be a number',
        'Boost must be a number'
      )
    } else if (Number(this.state.boost) < 0) {
      newState.boostError = fbt(
        'Boost must be zero or greater',
        'Boost must be zero or greater'
      )
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
