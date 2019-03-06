import React, { Component } from 'react'
import Slider from 'rc-slider'

class StepsProgress extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { stepsTotal, stepCurrent } = this.props

    return (
      <div className="step-slider">
        <Slider
          defaultValue={stepCurrent}
          step={1}
          disabled={true}
          min={0}
          max={stepsTotal}
          dots
        />
      </div>
    )
  }
}

export default StepsProgress
