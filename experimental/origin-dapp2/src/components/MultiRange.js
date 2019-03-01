import React, { Component } from 'react'

class MultiRange extends Component {
  constructor(props) {
    super(props)
    this.state = {
      low: props.low || 0,
      high: props.high || 1000,
      min: 0,
      max: 1000
    }
  }

  componentDidUpdate(prevProps) {
    const newState = {}
    if (prevProps.low !== this.props.low) {
      newState.low = this.props.low || 0
    }
    if (prevProps.high !== this.props.high) {
      newState.high = this.props.high || 1000
    }
    if (newState.low || newState.high) {
      this.setState(newState)
    }
  }

  render() {
    const low =
      this.state.low > this.state.max ? this.state.max : this.state.low
    const high =
      this.state.high > this.state.max ? this.state.max : this.state.high
    const lowPct = Math.round((low / this.state.max) * 10000) / 100
    const highPct = Math.round((high / this.state.max) * 10000) / 100
    return (
      <div
        className="multirange"
        style={{
          '--low': `${lowPct}%`,
          '--high': `${highPct}%`
        }}
      >
        <input
          type="range"
          value={String(this.state.low)}
          min="0"
          max="1000"
          step="10"
          onChange={e => {
            this.setState({ low: Number(e.target.value) }, () =>
              this.onChange()
            )
          }}
        />
        <input
          type="range"
          value={String(this.state.high)}
          min="0"
          max="1000"
          step="10"
          onChange={e => {
            this.setState({ high: Number(e.target.value) }, () =>
              this.onChange()
            )
          }}
        />
      </div>
    )
  }

  onChange() {
    if (this.props.onChange) {
      const { low, high } = this.state
      this.props.onChange({
        low: low === 0 ? undefined : low,
        high: high >= 1000 ? undefined : high
      })
    }
  }
}

export default MultiRange

require('react-styl')(`
  .multirange
    position: relative
    width: 100%
    input
      padding: 0
      margin: 0
      display: inline-block
      vertical-align: top
      width: 100%
    input:nth-child(1)
      position: absolute
      &::-webkit-slider-thumb
        z-index: 2
        position: relative
    input:nth-child(2)
      position: relative
      --track-background: linear-gradient(to right, transparent calc(var(--low) + 3px), var(--steel) 0, var(--steel) calc(var(--high) - 3px), transparent 0) no-repeat 0 45% / 100% 40%;
      &::-webkit-slider-runnable-track
        background: var(--track-background)

`)
