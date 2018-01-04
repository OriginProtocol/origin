import React, { Component } from 'react'

const Overlay = (props) => {
  return (
	  <div>
	    <div className="overlay h-100 row align-items-center text-center">
	    </div>
	    <div className="overlay-box">
	      <div>
	        <img src={props.imageUrl} role="presentation"/>
	      </div>
	      <div>{props.heading}</div>
	      <div>{props.description}</div>
	    </div>
	  </div>
  )
}

export default Overlay
