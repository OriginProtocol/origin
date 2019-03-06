import React from 'react'

export const Pictures = ({ pictures, className }) => {
  return(
    <div className={className}>
      {pictures.map(pictureUrl => (
        <div className="photo" key={pictureUrl}>
          <img src={pictureUrl} role="presentation" />
        </div>
      ))}
    </div>
  )
}