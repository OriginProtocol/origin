import React from 'react'
import { View } from 'react-native'

const Dots = ({ currentPage, pagesCount }) => (
  <View style={styles.container}>
    {[...Array(pagesCount)].map((_, index) => {
      const active = index === currentPage

      return (
        <View
          key={index}
          style={{
            ...styles.dot,
            backgroundColor: active ? '#eaf0f3' : '#0b1823'
          }}
        />
      )
    })}
  </View>
)

const styles = {
  container: {
    alignItems: 'center',
    flex: 0,
    flexDirection: 'row',
    marginBottom: '10%'
  },
  dot: {
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8
  }
}

export default Dots
