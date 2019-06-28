import React from 'react'

const Error404 = props => {
  return (
    <div className="error-404">
      <div className="container">
        <div className="row">
          <div className="col-12">{props.children}</div>
        </div>
      </div>
      <div className="error-content-section">
        <div className="images-container">
          <img src="images/error-404/mask.svg" className="mask" />
          <img src="images/error-404/404.svg" className="code" />
          <img src="images/error-404/blocks-1.svg" className="blocks-1" />
          <img src="images/error-404/blocks-2.svg" className="blocks-2" />
          <img src="images/error-404/dude.svg" className="dude" />
        </div>
      </div>
    </div>
  )
}

export default Error404

require('react-styl')(`
  .error-404
    margin-bottom: -4rem
    height: 100vh  
    overflow: hidden
  
    .container
      padding-top: 3rem
      max-width: 760px
    
    .error-content-section
      position: relative
      margin-bottom: -40px
      top: -40px
      z-index: -1

      .images-container
        position: relative
        height: 50vw

        .mask
          position: absolute
          top: 20px
  
        .mask
          position: absolute
          left: 0%
          top: 10px
          width: 100%
  
        .code
          position: absolute
          right: 5%
          width: 40%
  
        .blocks-1
          position: absolute
          bottom: -5%
          left: 50%
          width: 30%
  
        .blocks-2
          position: absolute
          right: 60%
          top: 50%
          width: 30%
  
        .dude
          position: absolute
          left: 39%
          top: 36%
          width: 8%
    
  @media (max-width: 768px)
    .error-404
      .error-content-section
        margin-bottom: 40px
        top: 40px
      
        .images-container
          height: 70vw
        
          .mask
            left: -70%
            top: 0px
            width: 200%
          
          .code
            right: -5%
            top: 0px
            width: 60%
          
          .blocks-1
            left: 40%
            width: 50%
          
          .blocks-2
            right: 62%
            top: 36%
            width: 50%
          
          .dude
            left: 36%
            top: 20%
            width: 20%
`)
