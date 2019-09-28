import React from 'react'

const NewsCard = props => (
  <div
    className="mb-5 bordered"
    style={{ backgroundColor: 'white', borderRadius: '10px' }}
  >
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
        Read more
      </a>
    </div>
  </div>
)

export default NewsCard
