// https://github.com/karl-run/react-bottom-scroll-listener/blob/master/lib/index.js
import React, { useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

const BottomScrollListener = (props) => {

  const callbackWrapper = props.debounce ? debounce : f => f

  const rebindListenerOnProps = [props.hasMore, props.debounce, props.onTop, props.offset]

  const onScrollListener = useCallback(callbackWrapper(() => {
    const scrollNode = document.scrollingElement || document.documentElement

    if (
      scrollNode.scrollHeight - props.offset <=
        scrollNode.scrollTop + window.innerHeight &&
      props.hasMore
    ) {
      props.onBottom()
    }
  }, props.debounce, { trailing: true }), rebindListenerOnProps)

  useEffect(() => {
    document.addEventListener('scroll', onScrollListener)

    return () => {
      document.removeEventListener('scroll', onScrollListener)
    }
  }, rebindListenerOnProps)

  window.requestAnimationFrame(() => {
    if (
      document.body.clientHeight < window.innerHeight &&
      props.ready &&
      props.hasMore
    ) {
      props.onBottom()
    }
  })

  return !props.children ? null : <div>{props.children}</div>
}

BottomScrollListener.defaultProps = {
  debounce: 200,
  offset: 50,
  children: null
}

BottomScrollListener.propTypes = {
  onBottom: PropTypes.func.isRequired,
  debounce: PropTypes.number,
  offset: PropTypes.number,
  children: PropTypes.element
}

export default BottomScrollListener
