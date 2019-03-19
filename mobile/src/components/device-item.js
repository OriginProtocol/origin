import React, { Component } from 'react'
import Moment from 'react-moment'
import { Image, StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

export default class DeviceItem extends Component {
  render() {
    const { item, handleLink, handleReject, handleUnlink, style } = this.props
    const app_info = item.link && item.link.app_info
    const { browser, platform } = app_info && app_info.user_agent

    return (
      <View style={[ styles.listItem, style ]}>
        <View style={styles.iconsContainer}>
          {browser == 'Chrome' &&
            <Image source={require(`${IMAGES_PATH}chrome-icon.png`)} />
          }
          {browser !== 'Chrome' &&
            <Image source={require(`${IMAGES_PATH}app-icon.png`)} />
          }
          {item.linked && <Image source={require(`${IMAGES_PATH}link-icon.png`)} style={styles.icon} />}
        </View>
        {!item.linked && handleLink &&
          <View style={styles.content}>
            <Text style={styles.identification}>Link <Text style={styles.vendor}>{browser} on {platform}</Text>?</Text>
            <Text style={styles.muted}>Expires on <Moment element={Text} format="MMMM D, YYYY @ h:mmA">{item.link.expires_at}</Moment></Text>
            <View style={styles.actions}>
              <OriginButton size="small" type="primary" title="Link" onPress={handleLink} style={{ marginRight: 10 }} />
              <OriginButton size="small" type="danger" title="No Thanks" onPress={handleReject} />
            </View>
          </View>
        }
        {!item.linked && !handleLink &&
          <View style={styles.content}>
            <Text style={styles.identification}>You had been linked to <Text style={styles.vendor}>{browser} on {platform}</Text></Text>
            <Text style={styles.muted}>Unlinked on <Moment element={Text} format="MMMM D, YYYY @ h:mmA">{item.link.unlinked_at}</Moment></Text>
          </View>
        }
        {item.linked &&
          <View style={styles.content}>
            <Text style={styles.identification}><Text style={styles.vendor}>{platform} {browser}</Text>{item.link_id} </Text>
            <Text style={styles.muted}>Linked at <Moment element={Text} format="MMMM D, YYYY @ h:mmA">{item.link.linked_at}</Moment></Text>
            <View style={styles.actions}>
              {handleUnlink && <OriginButton size="small" type="primary" title="Unlink" onPress={handleUnlink} />}
            </View>
          </View>
        }
      </View>
    )
  }
}

DeviceItem.propTypes = {
  item: PropTypes.shape({
    linked: PropTypes.bool.isRequired,
  }),
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
    marginRight: 20,
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
    fontSize: 12,
    fontWeight: '300',
  },
  vendor: {
    fontWeight: 'normal',
  },
})
