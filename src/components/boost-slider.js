import React, { Component, Fragment } from 'react'
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

import origin from '../services/origin'

class BoostSlider extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedBoostAmount: defaultBoostValue,
      boostLevel: getBoostLevel(defaultBoostValue) || 0,
      selectedBoostAmountUsd: 0,
      allowanceRemaining: 0
    }

    this.checkOgnTransferAllowance = this.checkOgnTransferAllowance.bind(this)
    this.approveOgnTransfer = this.approveOgnTransfer.bind(this)
    this.onChange = this.onChange.bind(this)
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

    this.checkOgnTransferAllowance()
    this.onChange(this.state.selectedBoostAmount)
  }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
  }

  async checkOgnTransferAllowance() {
    const userAddress = await origin.contractService.currentAccount()
    const allowanceRemaining = await origin.token.getAllowance(userAddress)
    console.log('Allowance Remaining: ', allowanceRemaining)
    this.setState({
      allowanceRemaining
    })
  }

  async approveOgnTransfer() {
    const ognAmount = this.state.selectedBoostAmount
    const weiAmount = (ognAmount * 10 ** 18).toString()
    const transactionReceipt = await origin.token.approveContract(
      weiAmount,
      () => {
        this.checkOgnTransferAllowance()
      }
    )
  }

  async onChange(value) {
    const boostLevel = getBoostLevel(value)
    this.setState({
      selectedBoostAmount: value,
      boostLevel
    })
    const disableNextBtn = value > this.state.allowanceRemaining || value > this.props.ognBalance
    this.props.onChange(value, boostLevel, disableNextBtn)
    const selectedBoostAmountUsd = await getFiatPrice(value, 'USD')
    this.setState({
      selectedBoostAmountUsd
    })
  }

  render() {
    return (
      <div className="boost-slider">
        {this.props.ognBalance > 0 &&
          <Fragment>
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
              <span className={`boosted badge ${this.state.boostLevel.toLowerCase()}`}>
                <img src="images/boost-icon-arrow.svg" role="presentation" />
              </span>
              { this.state.boostLevel }
              { this.state.boostLevel.match(/medium/i) && ' (recommended)'}
              <div className="amount-container">
                <p>
                  <img src="images/ogn-icon.svg" role="presentation" />
                  { this.state.selectedBoostAmount }&nbsp;
                  <a href="#" target="_blank" rel="noopener noreferrer">OGN</a>
                  {/* <span className="help-block"> | { this.state.selectedBoostAmountUsd } USD</span> */}
                </p>
              </div>
            </div>
            <Slider
              className={ `boost-level-${this.state.boostLevel}` }
              onChange={ this.onChange }
              defaultValue={ this.state.selectedBoostAmount }
              min={ minBoostValue }
              max={ maxBoostValue } />
            <p className="text-italics">{ boostLevels[this.state.boostLevel].desc }</p>
          </Fragment>
        }
        {this.props.ognBalance === 0 &&
          <div className="info-box">
            <p>You have 0 <a href="#" target="_blank" rel="noopener noreferrer">OGN</a> in your wallet and cannot boost.</p>
            {/* TODO:John - update all faucet links to a hosted OGN faucet and eventually to an exchange or something */}
            <a
              className="btn btn-primary"
              href="http://localhost:5000/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={ this.pollOgnBalance }
            >
              Get OGN
            </a>
          </div>
        }
        {this.props.ognBalance > 0 && this.props.ognBalance < this.state.selectedBoostAmount &&
          <div className="info-box warn">
            <p>You don’t have enough OGN in your wallet.</p>
            <a
              className="btn btn-primary"
              href="http://localhost:5000/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={ this.pollOgnBalance }
            >
              Get OGN
            </a>
          </div>
        }
        {this.props.ognBalance > 0 && this.state.selectedBoostAmount > this.state.allowanceRemaining &&
          <div className="info-box">
            <p>You must approve Origin to transfer your OGN.</p>
            <button
              className="btn btn-primary"
              onClick={this.approveOgnTransfer}
            >
              Approve
            </button>
          </div>
        }
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
