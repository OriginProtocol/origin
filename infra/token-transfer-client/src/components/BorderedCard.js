import React from 'react'

const BorderedCard = ({ children, shadowed, ...rest }) => (
  <div
    className={`card-wrapper${shadowed ? ' shadowed' : ' bordered'}`}
    {...rest}
  >
    {children}
  </div>
)

export default BorderedCard
