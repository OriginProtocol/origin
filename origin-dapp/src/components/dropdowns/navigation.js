import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import Dropdown from 'components/dropdown'

class NavigationDropdown extends Component {
  constructor() {
    super()
    this.state = { open: false }
  }

  toggle() {
    const open = !this.state.open
    this.setState({ open })
  }

  render() {
    const { open } = this.state

    return (
      <Dropdown
        className="nav-item navigation"
        open={open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          className="nav-link dropdown-toggle"
          role="button"
          id="navigationDropdown"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="navigation_dropdown"
          onClick={() => this.toggle()}
        >
          <img src="images/origin-icon-white.svg" alt="Origin menu" />
        </a>
        <div
          className={`dropdown-menu ${open ? ' show' : ''}`}
          aria-labelledby="navigationDropdown"
          onClick={e => {
            if (e.target.nodeName === 'A') this.setState({ open: false })
          }}
        >
          <div className="actual-menu d-flex flex-column">
            <div>asdassdadasasd</div>
            <div>asdassdadasasd</div>
            <div>asdassdadasasd</div>
            <hr/>
            <div>asdassdadasasd</div>
            <div>asdassdadasasd</div>
          </div>
        </div>
      </Dropdown>
    )
  }
}

export default NavigationDropdown
