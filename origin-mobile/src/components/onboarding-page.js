import React from 'react'
import { Dimensions, Text, View, ViewPropTypes } from 'react-native'

const OnboardingPage = ({
  image,
  title,
  subtitle,
  width,
  height,
}) => {
  let titleElement = title

  if (typeof title === 'string' || title instanceof String) {
    titleElement = (
      <View style={styles.padding}>
        <Text style={styles.title}>
          {title}
        </Text>
      </View>
    )
  }

  let subtitleElement = subtitle

  if (typeof subtitle === 'string' || subtitle instanceof String) {
    subtitleElement = (
      <View style={styles.padding}>
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.imageContainer}>{image}</View>
      {titleElement}
      {subtitleElement}
    </View>
  )
}

const { width, height } = Dimensions.get('window')

const styles = {
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: 0,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 0,
    paddingBottom: 60,
    width: '100%',
  },
  padding: {
    paddingHorizontal: 50,
  },
  title: {
    color: 'white',
    fontSize: 24,
    paddingBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
}

export default OnboardingPage
