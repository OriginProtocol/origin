import React, { Component } from 'react'
import { getFiatPrice } from 'utils/priceUtils'

class BoostSlider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedBoostAmount: this.props.max / 2,
      selectedBoostAmountUsd: 0
    }

    this.onChange = this.onChange.bind(this)
  }

  async componentDidMount() {
    const selectedBoostAmountUsd = await getFiatPrice( this.props.max / 2, 'USD' )
    this.setState({
      selectedBoostAmountUsd
    })
  }

  async onChange(event) {
    const value = event.target.value
    this.setState({
      selectedBoostAmount: value
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
        <img src="images/info-icon-inactive.svg" role="presentation" />
        <input onInput={ this.onChange } type="range" min={ this.props.min } max={ this.props.max } />
        <div>
          <img src="images/ogn-icon.svg" role="presentation" />
          { this.state.selectedBoostAmount } <a href="#" arget="_blank" rel="noopener noreferrer">OGN</a>
          <span> | { this.state.selectedBoostAmountUsd } USD</span>
        </div>
      </div>
    )
  }
}

export default BoostSlider
