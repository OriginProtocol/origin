import React, { useEffect } from 'react'
import ReactGA from 'react-ga'

ReactGA.initialize('UA-106384880-4', {
  debug: !process.env.ENABLE_GA,
  testMode: !process.env.ENABLE_GA
})

const withTracker = (WrappedComponent, options = {}) => {
  const trackPage = page => {
    ReactGA.set({
      page,
      ...options
    })
    ReactGA.pageview(page)
  }

  const HOC = props => {
    useEffect(() => trackPage(props.location.pathname), [
      props.location.pathname
    ])

    return <WrappedComponent {...props} />
  }

  return HOC
}

export default withTracker
