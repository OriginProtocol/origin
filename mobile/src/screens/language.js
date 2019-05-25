'use strict'

import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  DeviceEventEmitter,
  FlatList,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import { LANGUAGES, TRANSLATIONS } from '../constants'
import { setLanguage } from 'actions/Settings'
import setFbtLanguage, { findBestAvailableLanguage } from 'utils/language'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

class LanguageScreen extends Component {
  static navigationOptions = {
    title: String(fbt('Language', 'LanguageScreen.headerTitle')),
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
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
    const { navigation } = this.props

    // Sorted list of available languages
    const languages = LANGUAGES.map(i => {
      return { key: i[0], value: i[1] }
    }).sort((a, b) => (a.value > b.value ? 1 : -1))

    const selectedLanguage =
      this.props.settings.language || findBestAvailableLanguage()

    return (
      <ScrollView style={styles.container}>
        <FlatList
          data={languages}
          renderItem={({ item }) => (
            <TouchableHighlight
              onPress={() => this.handleSetLanguage(item.key)}
            >
              <View style={styles.listItem}>
                <View style={styles.textContainer}>
                  <Text>{item.value}</Text>
                </View>
                {
                  <View style={styles.iconContainer}>
                    {selectedLanguage === item.key && (
                      <Image
                        source={require(`${IMAGES_PATH}selected.png`)}
                        style={styles.selected}
                      />
                    )}
                  </View>
                }
              </View>
            </TouchableHighlight>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
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
  container: {
    flex: 1
  },
  list: {
    backgroundColor: '#f7f8f8'
  },
  separator: {
    backgroundColor: 'white',
    height: 1,
    marginRight: 'auto',
    width: '5%'
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flex: 1,
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: 14
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  selected: {
    marginRight: 17
  }
})
