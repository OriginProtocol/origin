import React from 'react'

const NewsCard = props => (
  <div
    className="mb-5 bordered"
    style={{ backgroundColor: 'white', borderRadius: '10px' }}
  >
    {props.feature && (
      <div className="p-3">
        <strong style={{ fontSize: '40px' }}>{props.title}</strong>
      </div>
    )}
    <div
      style={{
        height: '300px',
        backgroundImage: `url(${props.image})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        borderTopLeftRadius: props.feature ? 0 : '5px',
        borderTopRightRadius: props.feature ? 0 : '5px'
      }}
    ></div>
    {!props.feature && (
      <div className="p-3">
        <strong style={{ fontSize: '20px' }}>{props.title}</strong>
      </div>
    )}
    <div className="p-3" style={{ fontSize: '18px' }}>
      <p>{props.description}</p>
      <a href={props.link}>Read more</a>
    </div>
  </div>
)

export default NewsCard
