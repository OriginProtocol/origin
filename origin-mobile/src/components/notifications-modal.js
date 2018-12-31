import React, { Component, Fragment } from 'react'
import { Alert, Image, Modal, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import { storeNotificationsPermissions } from 'actions/Activation'

import OriginButton from 'components/origin-button'

import originWallet from '../OriginWallet'

const IMAGES_PATH = '../../assets/images/'

class NotifcationsModal extends Component {
  constructor(props) {
    super(props)

    this.handlePress = this.handlePress.bind(this)
  }

  async handlePress() {
    try {
      const permissions = await originWallet.requestNotifictions()

      this.props.storeNotificationsPermissions(permissions)
    } catch(e) {
      console.error(e)
      throw e
    }
  }

  render() {
    const { permissions, prompt } = this.props.activation.notifications
    const perspective = 'seller' // 'buyer'
    const visible = prompt && !permissions.hard.alert

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!visible}
      >
        <View style={styles.backdrop}>
          <View style={styles.content}>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={require(IMAGES_PATH + 'carousel-3.png')} />
            </View>
            <Text style={styles.heading}>Enable Notifications</Text>
            <Text style={styles.instruction}>
              {perspective === 'buyer' &&
                <Fragment>
                  {`We `}
                  <Text style={styles.emphatic}>highly recommend</Text>
                  {` enabling notifications so that you will know when your offer is accepted.`}
                </Fragment>
              }
              {perspective === 'seller' &&
                <Fragment>
                  {`We `}
                  <Text style={styles.emphatic}>highly recommend</Text>
                  {` enabling notifications so that you will know when an offer is made to purchase your listing.`}
                </Fragment>
              }
            </Text>
            <OriginButton
              onPress={this.handlePress}
              size="large"
              style={styles.button}
              textStyle={{ fontSize: 18 }}
              title="Enable Notifications"
              type="success"
            />
            <Text style={styles.skip}>{`I'll do this later`}</Text>
          </View>
        </View>
      </Modal>
    )
  }
}

const mapStateToProps = ({ activation }) => {
  return {
    activation,
  }
}

const mapDispatchToProps = dispatch => ({
  storeNotificationsPermissions: permissions => dispatch(storeNotificationsPermissions(permissions)),
})

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(256, 256, 256, 0.8)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  button: {
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 230,
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#2e3f53',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emphatic: {
    color: '#26d198',
    fontStyle: 'italic',
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 20,
    paddingLeft: 60,
  },
  instruction: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  skip: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(NotifcationsModal)
