import React, { Component } from 'react'

import Dropdown from 'components/Dropdown'

class DropdownLink extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Dropdown
        {...this.props}
        open={this.state.open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          className="nav-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            this.setState({ open: this.state.open ? false : true })
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {this.props.content}
        </a>
        <div
          className={`dropdown-menu dropdown-menu-right${
            this.state.open ? ' show' : ''
          }`}
        >
          {this.props.children}
        </div>
      </Dropdown>
    )
  }
}

export default DropdownLink
