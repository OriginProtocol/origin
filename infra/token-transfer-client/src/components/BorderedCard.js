import React from 'react'

const BorderedCard = ({ children, className, blue = false, ...rest }) => (
  <div
    className={`card-wrapper bordered ${blue ? 'blue' : ''} ${className}`}
    {...rest}
  >
    {children}
  </div>
)

export default BorderedCard
