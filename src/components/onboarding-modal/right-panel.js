import React, { Component } from 'react'
import PanelButtons from './panel-buttons'

export default class RightPanel extends Component {
  render() {
    const { step, closeModal } = this.props
    const { img, heading, content } = step

    return (
      <div className="flex-column col-xs-12 col-sm-8 right-panel">
        <div className="text-right mt-2">
          <img src="/images/close-icon.svg" alt="close-icon" onClick={closeModal}/>
        </div>
        {img}
        <div>
          {heading}
          <div className="content text-left">{content}</div>
          <PanelButtons {...this.props}/>
        </div>
      </div>
    )
  }
}
