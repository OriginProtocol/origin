import React from 'react'

const BorderedCard = ({ children, shadowed, blue = false, ...rest }) => (
  <div
    className={`card-wrapper ${shadowed ? 'shadowed' : 'bordered'} ${
      blue ? 'blue' : ''
    }`}
    {...rest}
  >
    {children}
  </div>
)

export default BorderedCard
