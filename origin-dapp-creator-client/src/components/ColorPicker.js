'use strict'

import React from 'react'

import { SketchPicker } from 'react-color'

class ColorPicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      displayColorPicker: false
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleClick() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  handleClose() {
    this.setState({ displayColorPicker: false })
  }

  handleChange(color) {
    this.props.onChange(this.props.name, color)
  }

  colorStyle() {
    return {
      background: this.props.config[this.props.name]
    }
  }

  render() {
    return (
      <div>
        <div className="wrapper">
          <div className="swatch" onClick={this.handleClick}>
            <div className="color" style={this.colorStyle()} />
            <div className="arrow">
              <div
                className={
                  this.state.displayColorPicker ? 'arrow-up' : 'arrow-down'
                }
              />
            </div>
          </div>
          <div className="description">{this.props.description}</div>
        </div>
        {this.state.displayColorPicker ? (
          <div className="popover">
            <div className="cover" onClick={this.handleClose} />
            <SketchPicker
              color={this.props.config[this.props.name]}
              onChange={this.handleChange}
            />
          </div>
        ) : null}
      </div>
    )
  }
}

export default ColorPicker

require('react-styl')(`
  .wrapper
    display: flex
    margin-bottom: 0.75rem

  .color
    width: 100%
    height: 100%

  .swatch
    width: 40px;
    height: 40px;
    padding: 7px
    background: var(--pale-grey-four)
    cursor: pointer
    border: 1px solid var(--light)
    border-radius: var(--default-radius)
    position: relative

  .arrow
    position: absolute
    bottom: 0
    right: 0
    width: 12px
    height: 12px
    background: black
    border-top-left-radius: var(--default-radius)
    text-align: center
    color: white
    font-size: 0.5rem
    padding-left: 3px
    padding-top: 5px
    border-top: 1px solid var(--light)
    border-left: 1px solid var(--light)

  .arrow-up
    width: 0
    height: 0
    border-left: 3px solid transparent
    border-right: 3px solid transparent
    border-bottom: 3px solid white

  .arrow-down
    width: 0
    height: 0
    border-left: 3px solid transparent
    border-right: 3px solid transparent
    border-top: 3px solid white

  .cover
    position: fixed
    top: 0
    right: 0
    bottom: 0
    left: 0

  .popover
    position: absolute
    z-index: 2

  .description
    color: var(--dark)
    font-size: 1.125rem
    margin-left: 0.5rem
    margin-top: 0.5rem
`)
