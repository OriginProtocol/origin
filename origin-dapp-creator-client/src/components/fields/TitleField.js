import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class TitleField extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.props.onChange(event)
  }

  render () {
    return (
    )
  }
}

export default TitleField
