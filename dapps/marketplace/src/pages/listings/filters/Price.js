import React, { Component } from 'react'

import Dropdown from 'components/Dropdown'
import MultiRange from 'components/MultiRange'

class PriceFilter extends Component {
  constructor(props) {
    super(props)
    this.state = { open: true, low: props.low, high: props.high }
  }
  render() {
    const { low, high } = this.state
    let label = 'Price'
    if (low > 0 && high === undefined) {
      label = `$${low}+`
    } else if (high > 0 && low === undefined) {
      label = `Up to $${high}`
    } else if (low !== undefined && high !== undefined) {
      label = `$${low} - $${high}`
    }
    return (
      <Dropdown
        className="ml-3"
        caret={false}
        content={
          <div className="dropdown-menu price-filter show">
            <div className="dropdown-content">
              <div className="prices">
                <div>{`$${low || '0'}`}</div>
                <div>{`$${high || '1000'}${
                  high >= 1000 || high === undefined ? '+' : ''
                }`}</div>
              </div>
              <MultiRange
                low={this.state.low}
                high={this.state.high}
                onChange={state => this.setState(state)}
              />
              {/* <div className="d-flex">
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.low}
                    onChange={e => this.setState({ low: e.target.value })}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">$</span>
                  </div>
                </div>
                <div className="mx-2">-</div>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.high}
                    onChange={e => this.setState({ high: e.target.value })}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">$</span>
                  </div>
                </div>
              </div> */}
            </div>
            <div className="actions">
              <button
                onClick={() => {
                  this.props.onChange(this.state)
                }}
              >
                Clear
              </button>
              <button
                onClick={() => {
                  this.props.onChange(this.state)
                }}
              >
                Apply
              </button>
            </div>
          </div>
        }
        open={this.state.open}
        onClose={() => this.setState({ open: false })}
      >
        <button
          className="btn btn-filter"
          onClick={() =>
            this.setState({ open: this.state.open ? false : true })
          }
        >
          {label}
        </button>
      </Dropdown>
    )
  }
}

export default PriceFilter

require('react-styl')(`
  .btn-filter
    border: 1px solid #455d75
    font-size: 14px
    font-weight: normal
    color: var(--dark)
    padding: 0.125rem 0.5rem
  .price-filter
    min-width: 14rem
    border-radius: 5px
    border: 0
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5)
    background-color: var(--pale-grey-three)
    padding: 0
    .dropdown-content
      padding: 0.75rem 1rem
    .prices
      display: flex
      justify-content: space-between
      font-weight: normal
      font-size: 14px
      margin-bottom: 0.25rem
    .actions
      display: flex
      button
        flex: 1
        padding: 0.5rem
        background: var(--pale-grey-two)
        border-style: solid
        border-color: var(--light)
        border-width: 1px 0 0 1px
        color: var(--clear-blue)
        &:first-child
          border-left-width: 0
          border-bottom-left-radius: 5px
        &:last-child
          border-bottom-right-radius: 5px
`)
