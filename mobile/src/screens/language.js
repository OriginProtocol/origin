'use strict'

import React from 'react'
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import { LANGUAGES } from '../constants'
import { setLanguage } from 'actions/Settings'
import setFbtLanguage, { findBestAvailableLanguage } from 'utils/language'
import ListStyles from 'styles/list'

const IMAGES_PATH = '../../assets/images/'

const languageScreen = props => {
  // Sorted list of available languages
  const languages = LANGUAGES.map(i => {
    return { key: i[0], value: i[1] }
  }).sort((a, b) => (a.value > b.value ? 1 : -1))

  const selectedLanguage =
    props.settings.language || findBestAvailableLanguage()

  return (
    <ScrollView style={styles.listContainer}>
      <FlatList
        data={languages}
        renderItem={({ item }) => (
          <TouchableHighlight
            onPress={() => {
              setFbtLanguage(item.key)
              props.setLanguage(item.key)
            }}
          >
            <View style={styles.listItem}>
              <View style={styles.listItemTextContainer}>
                <Text>{item.value}</Text>
              </View>
              {
                <View style={styles.listItemIconContainer}>
                  {selectedLanguage === item.key && (
                    <Image
                      source={require(`${IMAGES_PATH}selected.png`)}
                      style={styles.listItemSelected}
                    />
                  )}
                </View>
              }
            </View>
          </TouchableHighlight>
        )}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        style={styles.listContainer}
      />
    </ScrollView>
  )
}

languageScreen.navigationOptions = () => {
  return {
    title: String(fbt('Language', 'LanguageScreen.headerTitle')),
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }
}

const mapStateToProps = ({ settings }) => {
  return { settings }
}

const mapDispatchToProps = dispatch => ({
  setLanguage: language => dispatch(setLanguage(language))
})

export default connect(mapStateToProps, mapDispatchToProps)(languageScreen)

const styles = StyleSheet.create({
  ...ListStyles
})
