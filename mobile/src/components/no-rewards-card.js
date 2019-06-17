'use strict'

import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

const NoRewardsCard = props => {
  /* eslint-disable-next-line no-extra-semi */
  ;<View style={styles.card}>
    <View style={styles.imageContainer}>
      <Image
        resizeMethod={'scale'}
        resizeMode={'cover'}
        source={require(IMAGES_PATH + 'tout-header-image.png')}
        style={styles.image}
      />
    </View>
    <Text style={styles.heading}>
      <fbt desc="NoRewardsCard.title">
        Are you sure you don&apos;t want Origin Rewards?
      </fbt>
    </Text>
    <Text style={styles.content}>
      <Text style={styles.subtitle}>
        <fbt desc="NoRewardsCard.subtitle">
          Your new wallet will be ineligible to earn OGN.
        </fbt>
      </Text>
    </Text>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        textStyle={{ fontSize: 18, fontWeight: '900' }}
        title={fbt("I'm sure", 'NoRewardsCard.continue')}
        onPress={props.onConfirm}
        style={{ marginBottom: 10 }}
      />
      <OriginButton
        size="large"
        type="primary"
        textStyle={{ fontSize: 18, fontWeight: '900' }}
        title={fbt('No, wait', 'NoRewardsCard.goBack')}
        onPress={props.onRequestClose}
        outline
      />
    </View>
  </View>
}

export default NoRewardsCard

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 10
  },
  imageContainer: {
    marginHorizontal: -20,
    marginTop: -30,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden'
  },
  image: {
    width: '100%'
  },
  subtitle: {
    fontFamily: 'Lato',
    fontSize: 20,
    marginHorizontal: 50,
    paddingBottom: 10,
    textAlign: 'center'
  },
  cancel: {
    color: '#1a82ff',
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginHorizontal: 20
  },
  content: {
    fontSize: 14,
    marginBottom: 40,
    textAlign: 'center'
  },
  heading: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontWeight: '600',
    fontSize: 35,
    marginBottom: 20,
    textAlign: 'center'
  }
})
