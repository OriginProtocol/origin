import React from 'react'
import { toDataUrl } from 'myetherwallet-blockies'

import { formattedAddress } from 'utils/user'

const Identicon = ({ address, size = 30 }) => {
  // base64 encoded 1x1 blank white pixel when address is not defined
  const blankDataUrl = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
  const dataUrl = address ? toDataUrl(formattedAddress(address)) : blankDataUrl

  return (
    <img
      width={size}
      height={size}
      className="identicon"
      style={{ borderRadius: size / 2 }}
      alt="Wallet icon"
      src={dataUrl}
    />
  )
}

export default Identicon
