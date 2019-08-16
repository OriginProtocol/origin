import React from 'react'
import withIsMobile from 'hoc/withIsMobile'

const ProtocolLink = ({
  isMobile,
  isMobileApp,
  protocolLink,
  fallbackLink,
  ...props
}) => {
  if (!isMobile) {
    // No hacks on Desktop, Just open the fallback link in new tab
    return (
      <a
        {...props}
        src={fallbackLink}
        target="_blank"
        rel="noopener noreferrer"
      />
    )
  }

  return (
    <Link
      {...props}
      to={`/openapp?protocolLink=${encodeURIComponent(
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
