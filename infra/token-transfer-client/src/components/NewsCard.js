import React from 'react'

import BorderedCard from './BorderedCard'

const NewsCard = props => (
  <BorderedCard className="p-0">
    {props.feature && (
      <div className="p-4">
        <strong style={{ fontSize: '40px' }}>{props.title}</strong>
      </div>
    )}
    <div
      style={{
        paddingBottom: '70%',
        backgroundImage: `url(${props.image})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        borderTopLeftRadius: props.feature ? 0 : '5px',
        borderTopRightRadius: props.feature ? 0 : '5px',
        backgroundPosition: 'center bottom'
      }}
    ></div>
    {!props.feature && (
      <div className="px-4 pt-4">
        <strong style={{ fontSize: '24px', lineHeight: '28px' }}>
          {props.title}
        </strong>
      </div>
    )}
    <div className="p-4" style={{ fontSize: '14px' }}>
      <p>{props.description}</p>
      <a href={props.link} target="_blank" rel="noopener noreferrer">
        Read More
      </a>
    </div>
  </BorderedCard>
)

export default NewsCard
