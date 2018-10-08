import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import Slider from 'rc-slider'
import $ from 'jquery'
// TODO:John - pass a third arg of 'OGN' into getFiatPrice() once OGN prices are available in cryptonator API
// import { getFiatPrice } from 'utils/priceUtils'
import {
  boostLevels,
  getBoostLevel,
  minBoostValue,
  maxBoostValue
} from 'utils/boostUtils'

class BoostSlider extends Component {
  constructor(props) {
    super(props)

    // this.state = { selectedBoostAmountUsd: 0 }

    this.onChange = this.onChange.bind(this)
  }

  async componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()

    this.onChange(this.props.selectedBoostAmount)
  }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
  }

  async onChange(value) {
    const disableNextBtn = value > this.props.ognBalance
    this.props.onChange(value, getBoostLevel(value), disableNextBtn)
    // const selectedBoostAmountUsd = await getFiatPrice(value, 'USD')
    // this.setState({
    //   selectedBoostAmountUsd
    // })
  }

  render() {
    const { ognBalance } = this.props
    const boostLevel = getBoostLevel(this.props.selectedBoostAmount)

    return (
      <div className="boost-slider">
        <p>
          <FormattedMessage
            id={'boost-slider.boost-level'}
            defaultMessage={'Boost Level'}
          />
        </p>
        <img
          className="info-icon"
          src="images/info-icon-inactive.svg"
          role="presentation"
          data-toggle="tooltip"
          data-html="true"
          data-trigger="click"
          title={`<div class="boost-tooltip"><p>Your boost is a bit like a commission. It’s not required, but we recommend a boost level of 50 OGN for listings like yours.</p></div>`}
        />
        <div className="level-container">
          <span className={`boosted badge ${boostLevel.toLowerCase()}`}>
            <img src="images/boost-icon-arrow.svg" role="presentation" />
          </span>
          {boostLevel}
          {boostLevel.match(/medium/i) && ' (recommended)'}
          <div className="amount-container">
            <p>
              <img src="images/ogn-icon.svg" role="presentation" />
              {this.props.selectedBoostAmount}&nbsp;
              <Link
                to="/about-tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                OGN
              </Link>
              {/* <span className="help-block"> | { this.state.selectedBoostAmountUsd } USD</span> */}
            </p>
          </div>
        </div>
        <Slider
          className={`boost-level-${boostLevel}`}
          onChange={this.onChange}
          defaultValue={this.props.selectedBoostAmount}
          min={minBoostValue}
          disabled={!ognBalance}
          max={maxBoostValue}
        />
        <p className="text-italics">{boostLevels[boostLevel].desc}</p>
        {ognBalance === 0 && (
          <div className="info-box">
            <p>
              <FormattedMessage
                id={'boost-slider.no-ogn'}
                defaultMessage={
                  'You have 0 OGN in your wallet and cannot boost.'
                }
              />
            </p>
          </div>
        )}
        {ognBalance > 0 &&
          ognBalance < this.props.selectedBoostAmount && (
          <div className="info-box warn">
            <p>
              <FormattedMessage
                id={'boost-slider.insufficient-ogn'}
                defaultMessage={`You don't have enough OGN in your wallet.`}
              />
            </p>
          </div>
        )}
        <p className="help-block bottom-explainer">
          <FormattedMessage
            id={'boost-slider.denomination'}
            defaultMessage={'Boosts are always calculated and charged in OGN.'}
          />
          &nbsp;
          <Link to="/about-tokens" target="_blank" rel="noopener noreferrer">
            <FormattedMessage
              id={'boost-slider.learn-more'}
              defaultMessage={'Learn More'}
            />&nbsp;&#x25b8;
          </Link>
        </p>
      </div>
    )
  }
}

export default BoostSlider
