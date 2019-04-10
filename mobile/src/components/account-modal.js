'use strict'

import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { connect } from 'react-redux'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

class AccountModal extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      keyError: '',
      keyValue: ''
    }
  }

  componentDidUpdate() {
    const { keyError, keyValue } = this.state

    if (keyError && !keyValue) {
      this.setState({ keyError: '' })
    }
  }

  handleChange(keyValue) {
    this.setState({ keyValue: keyValue.trim() })
  }

  async handleSubmit() {
    DeviceEventEmitter.emit('addAccount', this.state.keyValue)
  }

  render() {
    const { dark, heading, onPress, visible, onRequestClose } = this.props

    return (
      <Modal
        animationType="slide"
        visible={!!visible}
        onRequestClose={() => {
          onRequestClose()
        }}
      >
        <SafeAreaView
          style={[styles.container, dark ? styles.containerDark : {}]}
        >
          <View style={[styles.nav, dark ? styles.navDark : {}]}>
            <TouchableOpacity
              onPress={onPress}
              style={styles.navImageContainer}
            >
              <Image
                source={require(`${IMAGES_PATH}close-icon.png`)}
                style={styles.close}
              />
            </TouchableOpacity>
            <View style={styles.navHeadingContainer}>
              <Text style={[styles.heading, dark ? styles.headingDark : {}]}>
                {heading || 'Add Account'}
              </Text>
            </View>
            <View style={styles.navImageContainer} />
          </View>
          <View style={[styles.body, dark ? styles.bodyDark : {}]}>
            <Text style={[styles.label, dark ? styles.labelDark : {}]}>
              Enter Your Private Key
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              onChangeText={this.handleChange}
              onSubmitEditing={this.handleSubmit}
              value={this.state.keyValue}
              style={[
                styles.input,
                dark ? styles.inputDark : {},
                this.state.keyError ? styles.invalid : {}
              ]}
            />
          </View>
          <View
            style={[
              styles.buttonContainer,
              dark ? styles.buttonContainerDark : {}
            ]}
          >
            <OriginButton
              size="large"
              type="primary"
              disabled={!this.state.keyValue}
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Submit Private Key'}
              onPress={this.handleSubmit}
            />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return {
    wallet
  }
}

export default connect(mapStateToProps)(AccountModal)

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center'
  },
  bodyDark: {
    backgroundColor: '#293f55'
  },
  button: {
    marginBottom: 10,
    marginHorizontal: 20
  },
  buttonContainer: {
    backgroundColor: '#f7f8f8',
    paddingTop: 10
  },
  buttonContainerDark: {
    backgroundColor: '#293f55'
  },
  container: {
    backgroundColor: 'white',
    flex: 1
  },
  containerDark: {
    backgroundColor: '#293f55'
  },
  heading: {
    fontFamily: 'Poppins',
    fontSize: 17,
    marginVertical: 'auto',
    textAlign: 'center'
  },
  headingDark: {
    color: 'white'
  },
  input: {
    backgroundColor: '#eaf0f3',
    borderColor: '#c0cbd4',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: 300
  },
  inputDark: {
    backgroundColor: '#0b1823',
    borderColor: '#6a8296',
    color: '#6a8296'
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  },
  label: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 24
  },
  labelDark: {
    color: 'white'
  },
  nav: {
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    flexDirection: 'row',
    height: 44
  },
  navDark: {
    borderColor: '#293f55'
  },
  navHeadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  navImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18 * 3
  }
})
