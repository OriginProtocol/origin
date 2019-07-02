'use strict'

import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

const BackArrow = ({ onClick, style }) => {
  return (
    <TouchableOpacity onPress={() => onClick()} style={style}>
      <Text style={{ fontSize: 40, color: '#e7e6f1' }}>&lsaquo;</Text>
    </TouchableOpacity>
  )
}

export default BackArrow
