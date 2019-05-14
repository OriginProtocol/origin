'use strict'

import React from 'react'
import { Image } from 'react-native'
import { toDataUrl } from 'myetherwallet-blockies'
import web3Utils from 'web3-utils'

const Identicon = ({ address, size = 30 }) => {
  const blankDataUrl =
    'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
  const dataUrl = address
    ? toDataUrl(web3Utils.toChecksumAddress(address))
    : blankDataUrl

  return (
    <Image
      style={{ width: size, height: size, borderRadius: size/ 2 }}
      source={{ uri: dataUrl }}
    />
  )
}

export default Identicon

