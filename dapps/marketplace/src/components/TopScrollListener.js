import React, { useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

const TopScrollListener = ({
  hasMore,
  debounce: debounceTime,
  onTop,
  offset,
  ready,
  children,
  onInnerRef,
  ...props
}) => {
  const elementRef = useRef(document)

  const rebindListenerOnProps = [
    elementRef.current,
    hasMore,
    debounceTime,
    offset
  ]

  const callbackWrapper = debounceTime ? debounce : f => f
  const onScrollListener = useCallback(
    callbackWrapper(
      () => {
        if (elementRef.current.scrollTop <= offset && hasMore) {
          onTop()
        }
      },
      debounceTime,
      { trailing: true }
    ),
    rebindListenerOnProps
  )

  useEffect(() => {
    elementRef.current.addEventListener('scroll', onScrollListener)

    return () => {
      elementRef.current.removeEventListener('scroll', onScrollListener)
    }
  }, rebindListenerOnProps)

  useEffect(() => {
    if (onInnerRef) {
      onInnerRef(elementRef.current)
    }
  }, elementRef.current)

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (
        elementRef.current.clientHeight < elementRef.current.innerHeight &&
        ready &&
        hasMore
      ) {
        onTop()
      }
    })
  })

  return !children ? null : (
    <div {...props} ref={elementRef}>
      {children}
    </div>
  )
}

TopScrollListener.defaultProps = {
  debounce: 200,
  offset: 50,
  children: null
}

TopScrollListener.propTypes = {
  onTop: PropTypes.func.isRequired,
  debounce: PropTypes.number,
  offset: PropTypes.number,
  children: PropTypes.element
}

export default TopScrollListener
