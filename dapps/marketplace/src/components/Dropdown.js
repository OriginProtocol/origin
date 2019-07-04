import React, { Component } from 'react'

class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.onBlur = this.onBlur.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.state = {
      open: false
    }
  }

  componentDidMount() {
    if (this.props.open) {
      this.doOpen()
    }
  }

  componentWillUnmount() {
    if (this.state.open) {
      this.doClose()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open === this.props.open) {
      return
    }

    if (prevProps.open && !this.props.open) {
      // Should close
      this.doClose()
    } else if (!prevProps.open && this.props.open) {
      // Should open
      this.doOpen()
    }
  }

  onBlur() {
    if (!this.mouseOver) {
      this.doClose()
    }
  }

  doOpen() {
    if (this.state.open) {
      return
    }

    document.addEventListener('click', this.onBlur)
    if (this.props.canSwipeLeft || this.props.canSwipeRight) {
      document.body.addEventListener('touchstart', this.onTouchStart)
      document.body.addEventListener('touchend', this.onTouchEnd)
      document.body.addEventListener('touchmove', this.onTouchMove)
    }

    this.setState({ open: true })
    setTimeout(() => this.dropdownEl.classList.add('show'), 10)
  }

  doClose() {
    if (!this.state.open || this.state.closing) {
      return
    }

    document.removeEventListener('click', this.onBlur)
    if (this.props.canSwipeLeft || this.props.canSwipeRight) {
      document.body.removeEventListener('touchstart', this.onTouchStart)
      document.body.removeEventListener('touchend', this.onTouchEnd)
      document.body.removeEventListener('touchmove', this.onTouchMove)
    }

    this.dropdownEl.classList.remove('show')
    if (this.props.onClose) {
      if (this.props.animateOnExit) {
        this.setState({ closing: true })

        this.onCloseTimeout = setTimeout(() => {
          this.setState({ open: false, closing: false })
          this.props.onClose()
        }, 300)
        return
      }

      this.props.onClose()
    }

    this.setState({ open: false })
  }

  onTouchStart(e) {
    if (this.state.closing || !this.state.open) {
      return
    }

    const {
      targetTouches: [event]
    } = e
    this.setState({
      firstClientX: event.clientX
    })
  }

  onTouchMove(e) {
    if (this.state.closing || !this.state.open) {
      return
    }

    const {
      targetTouches: [event]
    } = e

    const { firstClientX } = this.state
    const lastClientX = event.clientX

    const progress = 100 * ((lastClientX - firstClientX) / window.screen.width)

    const { canSwipeRight, canSwipeLeft } = this.props

    const rightSwipe = progress >= 0
    const leftSwipe = progress < 0

    if (this.props.onSwipeMove) {
      this.props.onSwipeMove({
        progress:
          (canSwipeRight && rightSwipe) || (canSwipeLeft && leftSwipe)
            ? Math.abs(progress)
            : null
      })
    }

    this.setState({
      lastClientX: event.clientX
    })
  }

  onTouchEnd() {
    if (this.state.closing || !this.state.open) {
      return
    }

    const { lastClientX, firstClientX } = this.state

    const progress = 100 * ((lastClientX - firstClientX) / window.screen.width)

    const { canSwipeRight, canSwipeLeft } = this.props

    const rightSwipe = progress >= 0
    const leftSwipe = progress < 0

    const absProgress = Math.abs(progress)

    if (this.props.onSwipeEnd) {
      this.props.onSwipeEnd(absProgress)
    }

    if (
      ((canSwipeRight && rightSwipe) || (canSwipeLeft && leftSwipe)) &&
      absProgress > 35
    ) {
      // Close if swiped for > 35% of screen's width
      this.doClose()
    }

    if (this.props.onSwipeEnd) {
      this.props.onSwipeEnd()
    }

    this.setState({
      lastClientX: null,
      firstClientX: null
    })
  }

  render() {
    let className = 'dropdown'
    if (this.props.className) className += ` ${this.props.className}`
    const El = this.props.el || 'div'

    return (
      <El
        ref={ref => (this.dropdownEl = ref)}
        className={className}
        onMouseOver={() => (this.mouseOver = true)}
        onMouseOut={() => (this.mouseOver = false)}
      >
        {this.props.children}
        {this.props.content && this.state.open ? this.props.content : null}
      </El>
    )
  }
}

export default Dropdown
