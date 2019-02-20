import React, { Component, Fragment } from 'react'
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import { promptForNotifications, storeNotificationsPermissions } from 'actions/Activation'

import OriginButton from 'components/origin-button'

import originWallet from '../OriginWallet'

const IMAGES_PATH = '../../assets/images/'

class NotifcationsModal extends Component {
  constructor(props) {
    super(props)

    this.handlePress = this.handlePress.bind(this)
    this.handleSkip = this.handleSkip.bind(this)
  }

  async handlePress() {
    try {
      const permissions = await originWallet.requestNotifications()

      if (!permissions.alert) {
        Alert.alert(
          '!',
          `You've declined our request to turn on push notifications, which we HIGHLY recommend. To fix this, you will need to change the permissions in your iPhone's Settings > Notifications > Origin Wallet.`,
          [{ text: 'OK', onPress: () => this.props.storeNotificationsPermissions(permissions) }]
        )
      } else {
        this.props.storeNotificationsPermissions(permissions)
      }
    } catch(e) {
      console.error(e)
      throw e
    }
  }

  handleSkip() {
    this.props.promptForNotifications()
  }

  render() {
    const { permissions, prompt } = this.props.activation.notifications
    const visible = prompt && !permissions.hard.alert
    let instruction

    switch(prompt) {
      case 'createListing':
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when an offer is made on your listing.`}
          </Fragment>
        )
        break
      case 'makeOffer':
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when your offer is accepted.`}
          </Fragment>
        )
        break
      case 'withdrawOffer':
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when someone sends you a message.`}
          </Fragment>
        )
        break
      case 'acceptOffer':
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when your funds are released.`}
          </Fragment>
        )
        break
      case 'dispute':
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when you recieve a response to your report of a problem.`}
          </Fragment>
        )
        break
      case 'finalize':
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when you recieve a review.`}
          </Fragment>
        )
        break
      case 'addData':
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when you recieve messages or new offers.`}
          </Fragment>
        )
        break
      default:
        instruction = (
          <Fragment>
            {`We `}
            <Text style={styles.emphatic}>highly recommend</Text>
            {` enabling notifications so that you will know when you recieve messages and transaction updates.`}
          </Fragment>
        )
    }

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!visible}
        onRequestClose={() => { console.log('Wallet modal closed') } }
      >
        <View style={styles.backdrop}>
          <View style={styles.content}>
            <View style={styles.imageContainer}>
              <Image
                source={require(IMAGES_PATH + 'carousel-3.png')}
                resizeMethod={'scale'}
                resizeMode={'contain'}
                style={styles.image}
              />
            </View>
            <Text style={styles.heading}>Enable Notifications</Text>
            <Text style={styles.instruction}>
              {instruction}
            </Text>
            <OriginButton
              onPress={this.handlePress}
              size="large"
              style={styles.button}
              textStyle={{ fontSize: 18 }}
              title="Enable Notifications"
              type="success"
            />
            <TouchableOpacity onPress={this.handleSkip}>
              <Text style={styles.skip}>{`I'll do this later.`}</Text>
            </TouchableOpacity>
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
  promptForNotifications: () => dispatch(promptForNotifications(null)),
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
    maxHeight: '100%',
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
  image: {
    height: '100%',
  },
  imageContainer: {
    flexShrink: 1,
    marginBottom: 20,
    maxHeight: 209,
    paddingLeft: '20%',
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
