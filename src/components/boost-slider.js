import React, { Component, Fragment } from 'react'
import { getFiatPrice } from 'utils/priceUtils'
import Slider from 'rc-slider'

class BoostSlider extends Component {
  constructor(props) {
    super(props)
    const { min, max, defaultValue } = this.props
    const range = max - min

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
      selectedBoostAmount: defaultValue || 0,
      boostLevel: this.getBoostLevel(defaultValue) || 0,
      selectedBoostAmountUsd: 0
    }
  }

  async componentDidMount() {
    const { defaultValue } = this.props
    const selectedBoostAmountUsd = 
      defaultValue ?
        await getFiatPrice( defaultValue / 2, 'USD' )
        : 0
    this.setState({
      selectedBoostAmountUsd
    })
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
        <img src={ `images/boost-icon-${this.state.boostLevel}.svg` } role="presentation" />
        { this.state.boostLevel }
        <div>
          <img src="images/ogn-icon.svg" role="presentation" />
          { this.state.selectedBoostAmount } <a href="#" arget="_blank" rel="noopener noreferrer">OGN</a>
          <span> | { this.state.selectedBoostAmountUsd } USD</span>
        </div>
        <Slider
          className={ `boost-level-${this.state.boostLevel}` }
          onChange={ this.onChange }
          defaultValue={ this.state.selectedBoostAmount }
          min={ this.props.min }
          max={ this.props.max } />
        <p className="text-italics">{ this.boostLevels[this.state.boostLevel].desc }</p>
      </div>
    )
  }
}

export default BoostSlider
