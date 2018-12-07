import React, { Component } from 'react'

import { Button, Popover, FormGroup } from '@blueprintjs/core'
import { SketchPicker } from 'react-color'

class ColorPicker extends Component {
  constructor(props) {
    super(props)
    this.handleChangeComplete = this.handleChangeComplete.bind(this)
  }

  handleChangeComplete(color) {
    this.setState({ color: color.hex })
  }

  render () {
    return (
      <FormGroup
          label={this.props.label}
          labelFor={this.props.label + "-color-picker"}
          inline={true}>
        <Popover>
          <Button>
            <div className="color-preview" style={{background: this.props.color}}></div>
          </Button>
          <SketchPicker
            color={ this.props.color }
            onChangeComplete={ this.handleChangeComplete }/>
        </Popover>
      </FormGroup>
    )
  }
}

export default ColorPicker

require('react-styl')(`
  .color-preview
    display: block
    width: 20px
    height: 20px
`)
