import React, { Component } from 'react'

import Dropdown from 'components/Dropdown'

class NotificationsNav extends Component {
  state = { open: true }
  render() {
    return (
      <Dropdown
        el="li"
        className="nav-item"
        open={this.state.open}
        onClose={() => this.setState({ open: false })}
        content={this.renderDropdown()}
      >
        <a
          className="nav-link notifications"
          href="#"
          onClick={e => {
            e.preventDefault()
            this.setState({ open: this.state.open ? false : true })
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <div className="notifications-icon active" />
        </a>
      </Dropdown>
    )
  }

  renderDropdown() {
    return (
      <div className="dropdown-menu dropdown-menu-right show">
        <div className="count">
          <div className="total">1</div>
          <div className="title">Notifications</div>
        </div>
        <div className="notification">
          <div className="image" />
          <div className="detail">
            <div className="title">MetaMask is now connected</div>
            <div className="description">
              0x32Be343B94f860124dC4fEe278FDCBD38C102D88
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default NotificationsNav

require('react-styl')(`
  .nav-item
    .notifications-icon
      width: 2.2rem
      height: 1.6rem
      background: url(images/alerts-icon.svg) no-repeat center
      background-size: contain
      position:relative
      &.active
        &::after
          content: "";
          width: 14px;
          height: 14px;
          background: var(--greenblue);
          border-radius: 10px;
          border: 2px solid var(--dusk);
          position: absolute;
          top: 0;
          right: 2px;

    &.show .notifications-icon
      background-image: url(images/alerts-icon-selected.svg)
      &.active::after
        border-color: white
`)
