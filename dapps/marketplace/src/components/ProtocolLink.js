import React from 'react'
import withIsMobile from 'hoc/withIsMobile'

import Link from 'components/Link'

import omit from 'lodash/omit'

const ProtocolLink = ({ isMobile, protocolLink, fallbackLink, ...props }) => {
  const linkProps = omit(props, ['isMobileApp'])
  if (!isMobile) {
    // No hacks on Desktop, Just open the fallback link in new tab
    return (
      <a
        {...linkProps}
        src={fallbackLink}
        target="_blank"
        rel="noopener noreferrer"
      />
    )
  }

  return (
    <Link
      {...linkProps}
      to={`/openapp/?protocolLink=${encodeURIComponent(
        protocolLink
      )}&fallbackLink=${encodeURIComponent(fallbackLink)}`}
      onClick={e => {
        if (props.onClick) {
          props.onClick(e)
        }
      }}
    />
  )
}

export default withIsMobile(ProtocolLink)
