'use strict'

import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

const BackArrow = ({ onClick, style }) => {
  return (
    <TouchableOpacity onPress={() => onClick()} style={style}>
      <Text style={{ fontSize: 40, color: '#94a7b5' }}>&lsaquo;</Text>
    </TouchableOpacity>
  )
}

export default BackArrow
