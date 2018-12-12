import React, { Component, Fragment } from 'react'
import TooltipBS from 'react-bootstrap/lib/Tooltip'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

let counter = 0

class Tooltip extends Component {
  constructor() {
    super()
    this.id = `tooltip-${counter++}`
  }

  render() {
    const { trigger, placement, content, children, delay } = this.props
    const overlay = <TooltipBS id={this.id}>{content}</TooltipBS>
    const overlayProps = { trigger, placement, overlay, delay }

    return (
      <OverlayTrigger {...overlayProps}>
        <Fragment>{children}</Fragment>
      </OverlayTrigger>
    )
  }
}

export default Tooltip
