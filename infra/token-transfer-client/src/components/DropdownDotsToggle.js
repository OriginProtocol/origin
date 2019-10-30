import React from 'react'

class DropdownDotsToggle extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    e.preventDefault()

    this.props.onClick(e)
  }

  render() {
    return (
      <a href="" onClick={this.handleClick}>
        <span className="ml-2" style={{ fontWeight: 900, color: '#bdcbd5' }}>
          &#8942;
        </span>
      </a>
    )
  }
}

export default DropdownDotsToggle
