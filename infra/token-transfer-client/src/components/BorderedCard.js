import React from 'react'

const BorderedCard = props => (
  <div className={`card-wrapper${props.shadowed ? ' shadowed' : ' bordered'}`}>
    {props.children}
  </div>
)

export default BorderedCard
