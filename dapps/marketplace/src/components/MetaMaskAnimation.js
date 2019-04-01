import React from 'react'
import { fbt } from 'fbt-runtime'

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
    <fbt desc="MetaMaskAnimation.browserNotSupported">
      Your browser does not support the video tag.
    </fbt>
  </video>
)

export default MetaMaskAnimation
