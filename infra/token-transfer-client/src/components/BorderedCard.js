import React from 'react'

const BorderedCard = ({ children, className, blue = false, ...rest }) => (
  <div
    className={`card-wrapper bordered${className ? ` ${className}` : ''}`}
    {...rest}
  >
    {children}
  </div>
)

export default BorderedCard
