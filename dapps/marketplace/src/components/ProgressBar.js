import React, { Component } from 'react'

class ProgressBar extends Component {
  constructor(props) {
    super(props)
    this.triggerAnimation = true
  }

  render() {
    const { progress, showIndicators } = this.props
    /* For triggering animation first render of react component needs to set
     * the width to 0. All subsequent renders set it to the actuall value.
     */
    const triggerAnimationThisFrame = this.triggerAnimation
    if (progress > 0 && this.triggerAnimation) {
      setTimeout(() => {
        this.triggerAnimation = false
        this.forceUpdate()
      }, 250)
    }

    return (
      <div className="blue-progress-bar-holder">
        <div className="blue-progress-bar mt-3">
          <div className="background" />
          {progress > 0 && (
            <div
              className="foreground"
              style={{
                width: `${
                  !triggerAnimationThisFrame
                    ? (progress / this.props.maxValue) * 100
                    : '0'
                }%`
              }}
            />
          )}
        </div>
        {showIndicators && (
          <div className="indicators d-flex justify-content-between mt-2">
            <div>0</div>
            <div>{this.props.maxValue / 4}</div>
            <div>{(this.props.maxValue / 4) * 2}</div>
            <div>{(this.props.maxValue / 4) * 3}</div>
            <div>{this.props.maxValue}</div>
          </div>
        )}
      </div>
    )
  }
}

export default ProgressBar

require('react-styl')(`
  .blue-progress-bar-holder
    .indicators
      font-size: 10px
      color: #455d75
    .blue-progress-bar
      .background
        background-color: var(--pale-grey-two)
        border-radius: 5px
        border: 1px solid #c2cbd3
        height: 10px
        position: absolute
        z-index: 1
        top: 0
        left: 0
        bottom: 0
        right: 0
      .foreground
        background-color: var(--clear-blue)
        border: 1px solid var(--greenblue)
        border-radius: 5px
        height: 100%
        z-index: 2
        position: relative
        -webkit-transition: width 0.5s
        transition: width 0.5s
      height: 10px
      width: 100%
      position: relative    
`)
