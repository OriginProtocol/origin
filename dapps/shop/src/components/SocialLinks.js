import React from 'react'

import useConfig from 'utils/useConfig'

import TwitterIcon from 'components/icons/Twitter'
import MediumIcon from 'components/icons/Medium'
import InstagramIcon from 'components/icons/Instagram'
import FacebookIcon from 'components/icons/Facebook'
import YouTubeIcon from 'components/icons/YouTube'

const SocialLinks = () => {
  const { config } = useConfig()
  const social = config.twitter || config.medium || config.instagram
  if (!social) {
    return null
  }

  return (
    <div className="social">
      {!config.twitter ? null : (
        <a href={config.twitter} title="Twitter">
          <TwitterIcon />
        </a>
      )}
      {!config.facebook ? null : (
        <a href={config.facebook} title="Facebook">
          <FacebookIcon />
        </a>
      )}
      {!config.youtube ? null : (
        <a href={config.youtube} title="YouTube">
          <YouTubeIcon />
        </a>
      )}
      {!config.medium ? null : (
        <a href={config.medium} title="Medium">
          <MediumIcon />
        </a>
      )}
      {!config.instagram ? null : (
        <a href={config.instagram} title="Instagram">
          <InstagramIcon />
        </a>
      )}
    </div>
  )
}
export default SocialLinks
