import React, { Component } from 'react'
import TooltipBS from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'

let counter = 0

class Tooltip extends Component {
  constructor() {
    super()
    this.id = `tooltip-${counter++}`
  }

  render() {
    const { trigger, placement, content, children, delay, triggerClass } = this.props
    const overlay = <TooltipBS id={this.id}>{content}</TooltipBS>
    const overlayProps = { trigger, placement, overlay, delay }

    return (
      <OverlayTrigger {...overlayProps}>
        <a
          href="javascript:void(0);"
          className={triggerClass}
        >
          {children}
        </a>
      </OverlayTrigger>
    )
  }
}

export default Tooltip
