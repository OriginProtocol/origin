import React, { Component } from 'react'
import Moment from 'react-moment'
import { Image, StyleSheet, Text, View } from 'react-native'

import OriginButton from './origin-button'

export default class DeviceItem extends Component {
  render() {
    const { item, handleLink, handleReject, handleUnlink, style } = this.props
    // placeholders
    const hasSufficientFunds = true
    const myAddress = '0x12Be343B94f860124dC4fEe278FDCBD38C101BAR'
    const counterpartyAddress = '0x34Be343B94f860124dC4fEe278FDCBD38C102BAZ'

    return (
      <View style={[ styles.listItem, style ]}>
        <View style={styles.iconsContainer}>
          {item.deviceType === 'Chrome' &&
            <Image source={require('../../assets/images/chrome-icon.png')} />
          }
          {item.deviceType !== 'Chrome' &&
            <Image source={require('../../assets/images/app-icon.png')} />
          }
          <Image source={require('../../assets/images/link-icon.png')} style={styles.icon} />
        </View>
        {handleLink &&
          <View style={styles.content}>
            <Text style={styles.identification}>Link <Text style={styles.vendor}>{item.deviceType}</Text>?</Text>
            <Text style={styles.muted}>{item.deviceId}</Text>
            <View style={styles.actions}>
              <OriginButton size="small" type="primary" title="Link" onPress={handleLink} style={{ marginRight: 10 }} />
              <OriginButton size="small" type="danger" title="No Thanks" onPress={handleReject} />
            </View>
          </View>
        }
        {!handleLink &&
          <View style={styles.content}>
            <Text style={styles.identification}><Text style={styles.vendor}>{item.deviceType}</Text> {item.deviceId}</Text>
            <Text style={styles.muted}>Linked <Moment element={Text} format="MMMM D, YYYY @ h:mmA">{item.timestamp}</Moment></Text>
            <View style={styles.actions}>
              {handleUnlink && <OriginButton size="small" type="primary" title="Unlink" onPress={handleUnlink} />}
            </View>
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    paddingTop: '5%',
  },
  content: {
    flex: 1,
    marginTop: 5,
  },
  icon: {
    bottom: -5,
    position: 'absolute',
    right: -5,
  },
  iconsContainer: {
    height: 51,
    marginRight: '5%',
    width: 51,
  },
  identification: {
    fontSize: 17,
    fontWeight: '300',
    marginBottom: 4,
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: '5%',
  },
  muted: {
    color: '#3e5d77',
  },
  vendor: {
    fontWeight: 'normal',
  },
})
