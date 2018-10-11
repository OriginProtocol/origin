import React, { Component } from 'react'
import PanelButtons from './panel-buttons'

export default class RightPanel extends Component {
  render() {
    const { step, closeModal } = this.props
    const { img, heading, content } = step

    return (
      <div className="d-flex flex-column col-xs-12 col-sm-8 pb-2 pt-2 right-panel">
        <div className="text-right">
          <img
            className="close-icon"
            src="/images/close-icon.svg"
            alt="close-icon"
            onClick={closeModal}
            ga-category="seller_onboarding"
            ga-label="dismiss_modal"
          />
        </div>
        <div className="content-container d-flex flex-column justify-content-around">
          {img}
          {heading}
          <div className="content text-left">{content}</div>
          <PanelButtons {...this.props} />
        </div>
      </div>
    )
  }
}
