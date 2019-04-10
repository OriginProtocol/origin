'use strict'

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import Dots from 'components/dots'
import OriginButton from 'components/origin-button'

const OnboardingPagination = ({
  currentPage,
  pagesCount,
  onCompletion,
  onEnable,
  onNext
}) => {
  const isLastPage = currentPage + 1 === pagesCount

  return (
    <View style={styles.container}>
      <Dots
        currentPage={currentPage}
        pagesCount={pagesCount}
        style={styles.dots}
      />
      <View style={styles.buttonContainer}>
        {!isLastPage && (
          <OriginButton
            size="large"
            type="primary"
            title="Next"
            textStyle={{ fontSize: 18 }}
            onPress={onNext}
          />
        )}
        {isLastPage && (
          <OriginButton
            size="large"
            type="success"
            title="Enable Notifications"
            textStyle={{ fontSize: 18 }}
            onPress={onEnable}
          />
        )}
      </View>
      <View style={styles.linkContainer}>
        {isLastPage && (
          <TouchableOpacity onPress={onCompletion}>
            <Text style={styles.link}>{`I'll do this later.`}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    width: '100%'
  },
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 0
  },
  link: {
    color: 'white'
  },
  linkContainer: {
    height: 40,
    paddingTop: 20
  }
})

export default OnboardingPagination
