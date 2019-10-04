// https://github.com/karl-run/react-bottom-scroll-listener/blob/master/lib/index.js
import React, { useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

const BottomScrollListener = ({
  hasMore,
  debounce: debounceTime,
  onBottom,
  offset,
  ready,
  children,
  className,
  bindOnContainer
}) => {
  const elementRef = useRef(document)

  const callbackWrapper = debounceTime ? debounce : f => f

  const rebindListenerOnProps = [
    hasMore,
    debounce,
    onBottom,
    offset,
    bindOnContainer
  ]

  const onScrollListener = useCallback(
    callbackWrapper(
      () => {
        if (!hasMore || !ready) {
          return
        }

        if (bindOnContainer) {
          if (
            elementRef.current.scrollHeight -
              (elementRef.current.scrollTop + elementRef.current.clientHeight) <
            offset
          ) {
            onBottom()
          }
          return
        }

        const scrollNode = document.scrollingElement || document.documentElement
        if (
          scrollNode.scrollHeight - offset <=
          scrollNode.scrollTop + window.innerHeight
        ) {
          onBottom()
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

  window.requestAnimationFrame(() => {
    if (
      ((bindOnContainer &&
        elementRef.current.scrollHeight < elementRef.current.clientHeight) ||
        (!bindOnContainer &&
          document.body.clientHeight < window.innerHeight)) &&
      ready &&
      hasMore
    ) {
      onBottom()
    }
  })

  return !children ? null : (
    <div className={className} ref={bindOnContainer ? elementRef : null}>
      {children}
    </div>
  )
}

BottomScrollListener.defaultProps = {
  debounce: 200,
  offset: 50,
  children: null,
  bindOnContainer: false
}

BottomScrollListener.propTypes = {
  onBottom: PropTypes.func.isRequired,
  debounce: PropTypes.number,
  offset: PropTypes.number,
  children: PropTypes.element,
  bindOnContainer: PropTypes.bool
}

export default BottomScrollListener
