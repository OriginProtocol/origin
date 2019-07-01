'use strict'

import React from 'react'
import { Image, View } from 'react-native'

import withConfig from 'hoc/withConfig'

const IMAGES_PATH = '../../assets/images/'

const Avatar = ({ config, source, size = 30, style = {} }) => {
  if (!source) {
    source = require(IMAGES_PATH + 'partners-graphic.png')
  } else if (typeof source === 'string') {
    // Check if the source contains an IPFS hash, if it does rewrite the URL so it
    // uses the configured IPFS gateway
    // Note: regex pattern only valid while IPFS uses sha256 as its hashing algorithm
    // No source provided, use default graphic
    const ipfsHashPattern = /Qm[1-9A-HJ-NP-Za-km-z]{44}/
    const ipfsHashMatch = source.match(ipfsHashPattern)
    if (ipfsHashMatch) {
      source = { uri: `${config.ipfsGateway}/ipfs/${ipfsHashMatch[0]}` }
    } else {
      // Might not be IPFS, use source directly
      source = { uri: source }
    }
  }

  return (
    <View
      style={{ backgroundColor: '#233f53', borderRadius: size / 2, ...style }}
    >
      <Image
        resizeMethod={'resize'}
        resizeMode={'cover'}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2
        }}
        source={source}
      />
    </View>
  )
}

export default withConfig(Avatar)
