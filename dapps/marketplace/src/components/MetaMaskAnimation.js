import React from 'react'

const MetaMaskAnimation = ({ light }) => (
  <video className="metamask-video" width="320" heigh="240" autoPlay loop>
    <source
      src={
        light
          ? 'images/metamask.mp4'
          : 'images/growth/metamask_in_browser_dark_bg.mp4'
      }
      type="video/mp4"
    />
    Your browser does not support the video tag.
  </video>
)

export default MetaMaskAnimation
