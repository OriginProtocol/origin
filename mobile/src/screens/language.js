'use strict'

import React, { Component } from 'react'
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
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

class LanguageScreen extends Component {
  static navigationOptions = () => {
    return {
      title: String(fbt('Language', 'LanguageScreen.headerTitle')),
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      }
    }
  }

  constructor(props) {
    super(props)
    this.handleSetLanguage = this.handleSetLanguage.bind(this)
  }

  handleSetLanguage(language) {
    setFbtLanguage(language)
    this.props.setLanguage(language)
  }

  render() {
    // Sorted list of available languages
    const languages = LANGUAGES.map(i => {
      return { key: i[0], value: i[1] }
    }).sort((a, b) => (a.value > b.value ? 1 : -1))

    const selectedLanguage =
      this.props.settings.language || findBestAvailableLanguage()

    return (
      <ScrollView style={styles.listContainer}>
        <FlatList
          data={languages}
          renderItem={({ item }) => (
            <TouchableHighlight
              onPress={() => this.handleSetLanguage(item.key)}
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
}

const mapStateToProps = ({ wallet, settings }) => {
  return { wallet, settings }
}

const mapDispatchToProps = dispatch => ({
  setLanguage: language => dispatch(setLanguage(language))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LanguageScreen)

const styles = StyleSheet.create({
  ...CommonStyles
})
