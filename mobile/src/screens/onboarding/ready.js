'use strict'

import React, { Component } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { NavigationActions } from 'react-navigation'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../../assets/images/'

export default class ReadyScreen extends Component {
  render() {
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'green-checkmark.png')}
            style={[styles.image, smallScreen ? { height: '33%' } : {}]}
          />
          <Text style={styles.title}>
            <fbt desc="ReadyScreen.title">
              You&apos;re ready to start buying and selling on Origin
            </fbt>
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Start using Origin', 'ReadyScreen.button')}
            onPress={() => {
              // Navigate to subroute to skip authentication requirement
              this.props.navigation.navigate(
                'GuardedApp',
                {},
                NavigationActions.navigate({ routeName: 'App' })
              )
            }}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  image: {
    marginBottom: '10%'
  },
  buttonsContainer: {
    paddingTop: 10,
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 36,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  }
})
