'use strict'

import React, { useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const { height } = Dimensions.get('window')
const smallScreen = height < 812

const RecoveryPhraseVerifyScreen = ({ navigation, wallet }) => {
  const [isRetry, setIsRetry] = useState(false)
  const [selectedWords, setSelectedWords] = useState([null, null, null])

  const getRandomWords = wordToInclude => {
    const randomWords = wallet.activeAccount.mnemonic
      .split(' ')
      .sort(() => Math.random() - Math.random())

    if (wordToInclude) {
      return randomWords
        .filter(w => w !== wordToInclude)
        .slice(0, 2)
        .concat(wordToInclude)
        .sort(() => Math.random() - Math.random())
    }
    return randomWords.slice(0, 3)
  }

  const randomWords = getRandomWords()
  const [wordsToVerify, setWordsToVerify] = useState(randomWords)
  const [wordOptions, setWordOptions] = useState(
    randomWords.map(getRandomWords)
  )

  const setSelectedWord = (index, word) => {
    const newSelectedWords = selectedWords.slice()
    newSelectedWords[index] = word
    setSelectedWords(newSelectedWords)
  }

  const renderWord = (word, verifyIndex) => {
    return (
      <View key={word}>
        <Text
          style={{ ...styles.subtitle, fontSize: 18, fontWeight: 'normal' }}
        >
          Word #{wallet.activeAccount.mnemonic.split(' ').indexOf(word) + 1}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {renderWordOptions(word, verifyIndex)}
        </View>
      </View>
    )
  }

  const renderWordOptions = (word, verifyIndex) => {
    const wordIndex = wordsToVerify.indexOf(word)
    return wordOptions[wordIndex].map((wordOption, i) => {
      const buttonStyles = [styles.button]

      if (i == 0) {
        buttonStyles.push(styles.buttonLeft)
      } else if (i == 2) {
        buttonStyles.push(styles.buttonRight)
      }
      if (selectedWords[verifyIndex] === wordOption) {
        buttonStyles.push(styles.buttonActive)
      }

      return (
        <TouchableOpacity
          key={wordOption}
          activeOpacity={1}
          onPress={() => setSelectedWord(verifyIndex, wordOption)}
          style={{ width: '30%' }}
        >
          <View style={buttonStyles}>
            <Text>{wordOption}</Text>
          </View>
        </TouchableOpacity>
      )
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackArrow onClick={() => navigation.goBack(null)} />
      <View style={styles.content}>
        <Text style={styles.title}>
          {isRetry ? (
            <fbt desc="RecoveryPhraseVerify.titleRetry">Oops, Try Again</fbt>
          ) : (
            <fbt desc="RecoveryPhraseVerify.title">
              Confirm Part of Recovery Phrase
            </fbt>
          )}
        </Text>
        {wordsToVerify.map(renderWord)}
      </View>
      <View style={styles.buttonContainer}>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Continue', 'RecoveryPhraseVerify.continueButton')}
          disabled={selectedWords.find(w => w === null) === null}
          onPress={() => {
            // Naive check of array equality but works for all cases here
            if (
              JSON.stringify(selectedWords) != JSON.stringify(wordsToVerify)
            ) {
              // Failure, generate a new set of verification words and set
              // retry state
              const randomWords = getRandomWords()
              setSelectedWords([null, null, null])
              setWordsToVerify(randomWords)
              setWordOptions(randomWords.map(getRandomWords))
              setIsRetry(true)
            } else {
              navigation.navigate('Authentication')
            }
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(RecoveryPhraseVerifyScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  button: {
    backgroundColor: 'white',
    borderColor: '#c2cbd3',
    opacity: 1,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 40,
    height: 50
  },
  buttonActive: {
    backgroundColor: '#eaf0f3',
    borderColor: '#6a8296'
  },
  buttonText: {
    fontFamily: 'Lato',
    fontSize: smallScreen ? 16 : 18,
    fontWeight: smallScreen ? '600' : '900',
    textAlign: 'center'
  },
  buttonLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  buttonRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10
  }
})
