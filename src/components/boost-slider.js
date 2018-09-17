import React, { Component } from 'react'
import Slider from 'rc-slider'
import $ from 'jquery'
// TODO:John - pass a third arg of 'OGN' into getFiatPrice() once OGN prices are available in cryptonator API
import { getFiatPrice } from 'utils/priceUtils'
import {
  boostLevels,
  getBoostLevel,
  defaultBoostValue,
  minBoostValue,
  maxBoostValue
} from 'utils/boostUtils'

class BoostSlider extends Component {
  constructor(props) {
    super(props)

    this.onChange = this.onChange.bind(this)

    this.state = {
      selectedBoostAmount: defaultBoostValue,
      boostLevel: getBoostLevel(defaultBoostValue) || 0,
      selectedBoostAmountUsd: 0
    }
  }

  async componentDidMount() {
    const selectedBoostAmountUsd = await getFiatPrice(
      this.state.selectedBoostAmount,
      'USD'
    )
    this.setState({
      selectedBoostAmountUsd
    })
    $('[data-toggle="tooltip"]').tooltip()
  }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
  }

  async onChange(value) {
    const boostLevel = getBoostLevel(value)
    this.setState({
      selectedBoostAmount: value,
      boostLevel
    })
    this.props.onChange(value, boostLevel)
    const selectedBoostAmountUsd = await getFiatPrice(value, 'USD')
    this.setState({
      selectedBoostAmountUsd
    })
  }

  render() {
    return (
      <div className="boost-slider">
        <p>Boost Level</p>
        <p className="help-block">
          Increase the chances of a fast and successful sale.
        </p>
        <img
          className="info-icon"
          src="images/info-icon-inactive.svg"
          role="presentation"
          data-toggle="tooltip"
          data-html="true"
          data-trigger="click"
          title={`<div class="boost-tooltip"> 
              <p>A boost increases the visibility of your listing and also works as a guarantee in case something goes wrong.</p>
              <a href="#" target="_blank" rel="noopener noreferrer">Learn More</a>
            </div>`}
        />
        <div className="level-container">
          <span
            className={`boosted badge ${this.state.boostLevel.toLowerCase()}`}
          >
            <img src="images/boost-icon-arrow.svg" role="presentation" />
          </span>
          {this.state.boostLevel}
          {this.state.boostLevel.match(/medium/i) && ' (recommended)'}
          <div className="amount-container">
            <p>
              <img src="images/ogn-icon.svg" role="presentation" />
              {this.state.selectedBoostAmount}&nbsp;
              <a href="#" target="_blank" rel="noopener noreferrer">
                OGN
              </a>
              {/* <span className="help-block"> | { this.state.selectedBoostAmountUsd } USD</span> */}
            </p>
          </div>
        </div>
        <Slider
          className={`boost-level-${this.state.boostLevel}`}
          onChange={this.onChange}
          defaultValue={this.state.selectedBoostAmount}
          min={minBoostValue}
          max={maxBoostValue}
        />
        <p className="text-italics">
          {boostLevels[this.state.boostLevel].desc}
        </p>
        {this.props.ognBalance === 0 && (
          <div className="info-box">
            <p>
              You have 0{' '}
              <a href="#" target="_blank" rel="noopener noreferrer">
                OGN
              </a>{' '}
              in your wallet and cannot boost.
            </p>
          </div>
        )}
        {this.props.ognBalance < this.state.selectedBoostAmount && (
          <div className="info-box warn">
            <p>You don’t have enough OGN in your wallet.</p>
          </div>
        )}
        <p className="help-block bottom-explainer">
          Boosts are always calculated and charged in&nbsp;
          <a href="#" target="_blank" rel="noopener noreferrer">
            OGN
          </a>.&nbsp; If there’s a problem with your listing, you forfeit this
          amount.&nbsp;
          <a href="#" target="_blank" rel="noopener noreferrer">
            Learn more &#x25b8;
          </a>
        </p>
      </div>
    )
  }
}

export default BoostSlider
