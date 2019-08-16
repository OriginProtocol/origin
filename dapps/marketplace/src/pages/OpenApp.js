import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'

/**
 * Tries to open the app using the `protocolLink`.
 * If it fails, opens the `fallbackLink`
 * 
 * Important: Use only on Mobile
 */
const OpenApp = ({ location, history }) => {
  const query = queryString.parse(location.search)

  const { protocolLink, fallbackLink } = query

  useEffect(() => {
    let timeout
    let loaded = false

    const onWindowBlur = () => {
      if (loaded) {
        return
      }
      loaded = true

      clearTimeout(timeout)

      // `blur` event is fired when the user navigates away from app
      // This means the user has an app installed for that protocol
      // Go back to where you came from
      history.goBack()
    }

    const frameEl = document.createElement('iframe')
    frameEl.setAttribute('src', protocolLink)

    frameEl.onload = () => console.log('load')

    frameEl.classList.add('absolute-iframe')

    window.addEventListener('blur', onWindowBlur)
    document.body.appendChild(frameEl)

    window.focus()

    timeout = setTimeout(() => {
      if (loaded) {
        return
      }
      loaded = true

      window.removeEventListener('blur', onWindowBlur)

      // If we don't have any blur event within a second,
      // Safe to assume there is no handler for the protocol

      // In that case, Open the fallback link in browser
      window.location.href = fallbackLink
    }, 1000)

    return () => {
      clearTimeout(timeout)

      window.removeEventListener('blur', onWindowBlur)
      if (document.body.contains(frameEl)) {
        document.body.removeChild(frameEl)
      }
    }
  }, [])

  return null
}

export default withRouter(OpenApp)

require('react-styl')(`
  .absolute-iframe
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    border: 0
    width: 100%
    height: 100%
`)