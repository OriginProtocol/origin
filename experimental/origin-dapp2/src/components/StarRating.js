import React, { Component } from 'react'

class StarRating extends Component {
  state = { tmpActive: 0 }
  render() {
    const active =
      this.props.onChange && this.state.mouseOver
        ? this.state.tmpActive
        : this.props.active || 0

    return (
      <div
        className={`star-rating${this.props.onChange ? ' interactive' : ''} ${
          this.props.small ? ' star-rating-small' : ''
        }`}
        onMouseOver={() => this.setState({ mouseOver: true })}
        onMouseOut={() => this.setState({ mouseOver: false })}
      >
        <div
          onClick={() => this.props.onChange(1)}
          onMouseOver={() => this.setState({ tmpActive: 1 })}
          className={active >= 1 ? 'active' : ''}
        />
        <div
          onClick={() => this.props.onChange(2)}
          onMouseOver={() => this.setState({ tmpActive: 2 })}
          className={active >= 2 ? 'active' : ''}
        />
        <div
          onClick={() => this.props.onChange(3)}
          onMouseOver={() => this.setState({ tmpActive: 3 })}
          className={active >= 3 ? 'active' : ''}
        />
        <div
          onClick={() => this.props.onChange(4)}
          onMouseOver={() => this.setState({ tmpActive: 4 })}
          className={active >= 4 ? 'active' : ''}
        />
        <div
          onClick={() => this.props.onChange(5)}
          onMouseOver={() => this.setState({ tmpActive: 5 })}
          className={active >= 5 ? 'active' : ''}
        />
      </div>
    )
  }
}

export default StarRating

require('react-styl')(`
  .star-rating
    display: flex
    justify-content: center
    &.interactive
      cursor: pointer
    > div
      background: url(images/star-empty.svg) no-repeat center
      background-size: contain
      width: 3rem
      height: 2.5rem
      &.active
        background-image: url(images/star-filled.svg)
    &.star-rating-small > div
      width: 1.25rem
      height: 1.25rem
`)
