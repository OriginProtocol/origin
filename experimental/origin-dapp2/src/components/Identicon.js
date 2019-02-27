import React from 'react'
import { toDataUrl } from 'myetherwallet-blockies'

const Identicon = ({ address, size = 30 }) => {
  const blankDataUrl =
    'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
  const dataUrl = address
    ? toDataUrl(web3.utils.toChecksumAddress(address))
    : blankDataUrl

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
