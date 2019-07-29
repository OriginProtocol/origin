import React from 'react'

const NewsCard = props => (
  <div className="wrapper">
    {props.feature && <div className="title feature">{props.title}</div>}
    <div
      className="image"
      style={{
        backgroundImage: `url(${props.image})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        borderTopLeftRadius: props.feature ? 0 : '5px',
        borderTopRightRadius: props.feature ? 0 : '5px'
      }}
    ></div>
    {!props.feature && <div className="title">{props.title}</div>}
    <div className="description">
      <p>{props.description}</p>
      <a href={props.link}>Read more</a>
    </div>
  </div>
)

export default NewsCard

require('react-styl')(`
  .wrapper
    margin: 50px 0 0 0
    border: 1px solid #dbe6eb
    background-color: white
    border-radius: 10px
    .image
      height: 300px;
    .feature
      font-size: 40px
    .title
      padding: 20px
      font-weight: bold;
    .description
      font-size: 18px
      padding: 20px;
`)
