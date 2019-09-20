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

import { CURRENCIES } from '../constants'
import { setCurrency } from 'actions/Settings'
import { findBestAvailableCurrency } from 'utils/currencies'
import ListStyles from 'styles/list'

const IMAGES_PATH = '../../assets/images/'

const currencyScreen = props => {
  // Sorted list of available currencies
  const currencies = CURRENCIES.map(currency => {
    return { key: currency.code, value: `${currency.symbol} ${currency.code}` }
  }).sort((a, b) => (a.code > b.code ? 1 : -1))

  const selectedCurrency =
    props.settings.currency || findBestAvailableCurrency()

  const handleSetCurrency = currencyCode => {
    props.setCurrency(
      CURRENCIES.find(currency => currency.code === currencyCode)
    )
  }

  return (
    <ScrollView style={styles.listContainer}>
      <FlatList
        data={currencies}
        renderItem={({ item }) => (
          <TouchableHighlight onPress={() => handleSetCurrency(item.key)}>
            <View style={styles.listItem}>
              <View style={styles.listItemTextContainer}>
                <Text>{item.value}</Text>
              </View>
              {
                <View style={styles.listItemIconContainer}>
                  {selectedCurrency.code === item.key && (
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

currencyScreen.navigationOptions = () => {
  return {
    title: String(fbt('Currency', 'CurrencyScreen.headerTitle')),
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
  setCurrency: currency => dispatch(setCurrency(currency))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(currencyScreen)

const styles = StyleSheet.create({
  ...ListStyles
})
