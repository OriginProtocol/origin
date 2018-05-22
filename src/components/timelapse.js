import { Component } from 'react'
import moment from 'moment'

class Timelapse extends Component {
  constructor(props) {
    super(props)

    this.updateTimelapse = this.updateTimelapse.bind(this)
    this.state = {
      timelapse: '',
    }
  }

  componentDidMount() {
    this.updateTimelapse()

    if (!this.props.reactive) {
      return
    }

    const delay = this.props.delay || 4000

    this.timeout = setTimeout(() => {
      this.ms = 1000
      this.interval = setInterval(this.updateTimelapse, this.ms)
    }, delay)
  }

  updateTimelapse() {
    const c = this
    const { reference } = c.props
    const seconds = moment().diff(reference, 'seconds')
    const second = 1
    const minute = 60 * second
    const hour = 60 * minute
    const day = 24 * hour
    const year = 365 * day
    let int = 0
    let timelapse = ''

    function conditionallyDecelerateInterval(measure) {
      if (c.ms / 1000 < measure) {
        clearInterval(c.interval)

        c.ms = measure * 1000
        c.interval = setInterval(c.updateTimelapse, c.ms)
      }
    }

    if (seconds < (c.props.delay || 4000) / 1000) {
      timelapse = 'a few seconds ago'
    } else if (seconds < minute) {
      timelapse = `${seconds} seconds ago`
    } else if (seconds < hour) {
      int = Math.floor(seconds / minute)

      timelapse = `${int} minute${int > 1 ? 's' : ''} ago`

      conditionallyDecelerateInterval(minute)
    } else if (seconds < day) {
      int = Math.floor(seconds / hour)

      timelapse = `${int} hour${int > 1 ? 's' : ''} ago`

      conditionallyDecelerateInterval(hour)
    } else if (seconds < year) {
      int = Math.floor(seconds / day)

      timelapse = `${int} day${int > 1 ? 's' : ''} ago`

      clearInterval(c.interval)
    } else {
      int = Math.floor(seconds / year)

      timelapse = `over ${int} year${int > 1 ? 's' : ''} ago`

      clearInterval(c.interval)
    }

    c.setState({ timelapse })
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const { timelapse } = this.state;

    return this.props.reference ? timelapse : null
  }
}

export default Timelapse
