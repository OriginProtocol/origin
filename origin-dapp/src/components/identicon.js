import React from 'react'
import IdenticonJS from 'identicon.js'

import { formattedAddress } from 'utils/user'

const Identicon = ({ address, size = 30 }) => {
  let data = null
  if (!address) {
    // base64 encoded 1x1 blank white pixel when address is not defined
    data =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
  } else {
    data = new IdenticonJS(formattedAddress(address), size).toString()
  }

  return (
    <img
      width={size}
      height={size}
      className="identicon"
      style={{ borderRadius: size / 2 }}
      alt="Wallet icon"
      src={`data:image/png;base64, ${data}`}
    />
  )
}

export default Identicon
