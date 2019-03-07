import React from 'react'

const Segments = ({ filled = 0, size = 100 }) => (
  <div style={{ width: size, height: size }} className="segments">
    <svg width="100%" height="100%" viewBox="0 0 42 42">
      {[1, 2, 3, 4, 5, 6].map(idx => (
        <circle
          key={idx}
          cx="21"
          cy="21"
          r="15.91549430918954"
          fill="transparent"
          stroke={filled >= idx ? 'var(--greenblue)' : 'var(--pale-grey-two)'}
          strokeWidth="5"
          strokeDasharray="14 86"
          strokeDashoffset={idx * -16.66 - 51.5}
        />
      ))}
    </svg>
  </div>
)

export default Segments

require('react-styl')(`
  .segments
    position: relative
    &::before
      content: ""
      width: 50%
      height: 50%
      background: url(images/nav/blue-circle-arrows.svg) no-repeat
      background-size: 100%
      border-radius: 10px
      position: absolute
      top: 25%
      right: 25%
      animation-name: spin
      animation-duration: 2s
      animation-iteration-count: infinite
      animation-timing-function: linear
`)
