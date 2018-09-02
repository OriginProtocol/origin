import React, { Component } from 'react'
import Slider from 'rc-slider'
import $ from 'jquery'
// TODO:John - pass a third arg of 'OGN' into getFiatPrice() once OGN prices are available in cryptonator API
import { getFiatPrice } from 'utils/priceUtils'

class BoostSlider extends Component {
  constructor(props) {
    super(props)
    const { min, max, defaultValue, ognBalance } = this.props
    const range = max - min
    let defaultVal = defaultValue || 0
    if (ognBalance === 0) {
      defaultVal = 0
    } else if (defaultValue > ognBalance) {
      defaultVal = ognBalance
    }

    this.boostLevels = {
      None: {
        min: 0,
        max: 0,
        desc: 'Your listing will get very low visibility and no seller guarantee'
      },
      Low: {
        min: min + 1,
        max: (range / 4),
        desc: 'Your listing will get below average visibility and low seller guarantee'
      },
      Medium: {
        min: range / 4 + 1,
        max: (range / 2),
        desc: 'Your listing will get average visibility and good seller guarantee'
      },
      High: {
        min: range / 2 + 1,
        max: ((range / 4) * 3),
        desc: 'Your listing will get above average visibility and excellent seller guarantee'
      },
      Premium: {
        min: (range / 4) * 3 + 1,
        max: max,
        desc: 'Your listing will get the best visibility and highest seller guarantee'
      }
    }

    this.onChange = this.onChange.bind(this)
    this.getBoostLevel = this.getBoostLevel.bind(this)

    this.state = {
      selectedBoostAmount: defaultVal,
      boostLevel: this.getBoostLevel(defaultVal) || 0,
      selectedBoostAmountUsd: 0
    }
  }

  async componentDidMount() {
    const selectedBoostAmountUsd = await getFiatPrice( this.state.selectedBoostAmount, 'USD' )
    this.setState({
      selectedBoostAmountUsd
    })
    $('[data-toggle="tooltip"]').tooltip()
  }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
  }

  getBoostLevel(value) {
    const { boostLevels } = this
    for (const levelName in boostLevels) {
      const thisLevel = boostLevels[levelName]
      if (value >= thisLevel.min && value <= thisLevel.max) {
        return levelName.toString()
      }
    }
  }

  async onChange(value) {
    this.setState({
      selectedBoostAmount: value,
      boostLevel: this.getBoostLevel(value)
    })
    const selectedBoostAmountUsd = await getFiatPrice(value, 'USD')
    this.setState({
      selectedBoostAmountUsd
    })
  }

  render() {
    return(
      <div className="boost-slider">
        <p>Boost Level</p>
        <p className="help-block">Increase the chances of a fast and successful sale.</p>
        <img
          className="info-icon"
          src="images/info-icon-inactive.svg"
          role="presentation"
          data-toggle="tooltip"
          data-html="true"
          data-trigger="click"
          title={ 
            `<div class="boost-tooltip"> 
              <p>A boost increases the visibility of your listing and also works as a guarantee in case something goes wrong.</p>
              <a href="#" target="_blank" rel="noopener noreferrer">Learn More</a>
            </div>`
          } />
        <div className="level-container">
          <img src={ `images/boost-icon-${this.state.boostLevel.toLowerCase()}.svg` } role="presentation" />
          { this.state.boostLevel }
          <div className="amount-container">
            <p>
              <img src="images/ogn-icon.svg" role="presentation" />
              { this.state.selectedBoostAmount }&nbsp;
              <a href="#" target="_blank" rel="noopener noreferrer">OGN</a>
              <span className="help-block"> | { this.state.selectedBoostAmountUsd } USD</span>
            </p>
          </div>
        </div>
        <Slider
          className={ `boost-level-${this.state.boostLevel}` }
          onChange={ this.onChange }
          defaultValue={ this.state.selectedBoostAmount }
          min={ this.props.min }
          max={ this.props.max } />
        <p className="text-italics">{ this.boostLevels[this.state.boostLevel].desc }</p>
        {this.props.ognBalance === 0 &&
          <div className="info-box">
            <p>You have 0 <a href="#" target="_blank" rel="noopener noreferrer">OGN</a> in your wallet and cannot boost.</p>
          </div>
        }
        {this.props.ognBalance < this.state.selectedBoostAmount &&
          <div className="info-box warn">
            <p>You don’t have enough OGN in your wallet.</p>
          </div>
        }
        <p className="help-block bottom-explainer">
          Boosts are always calculated and charged in&nbsp;
          <a href="#" target="_blank" rel="noopener noreferrer">OGN</a>.&nbsp;
          If there’s a problem with your listing, you forfeit this amount.&nbsp;
          <a href="#" target="_blank" rel="noopener noreferrer">Learn more &#x25b8;</a>
        </p>
      </div>
    )
  }
}

export default BoostSlider
