import React, { useEffect, useState } from 'react'
import { useSpring, animated } from 'react-spring'

const ProgressBar = ({
  onDone,
  duration = 2000,
  className = '',
  barClassName = '',
  delay = 0,
  done
}) => {
  const [config, setConfig] = useState({ duration })
  const props = useSpring({
    config,
    delay,
    from: { width: '0%' },
    to: { width: '100%' }
  })

  useEffect(() => {
    const d = setTimeout(() => {
      if (onDone) onDone()
    }, duration + delay)

    return () => {
      clearTimeout(d)
    }
  }, [])

  useEffect(() => {
    if (done) {
      setConfig({})
    }
  }, [done])

  return (
    <div className={`progress ${className}`}>
      <animated.div
        className={`progress-bar ${barClassName}`}
        style={{ ...props, transition: 'unset' }}
      />
    </div>
  )
}

export default ProgressBar
