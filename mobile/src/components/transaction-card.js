import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import OriginButton from 'components/origin-button'

class TransactionCard extends Component {
  constructor(props) {
    super(props)

    this.handleCancel = this.handleCancel.bind(this)
    this.handleSign = this.handleSign.bind(this)
    this.state = {}
  }

  handleCancel() {
    this.props.onPress()
  }

  handleSign() {
    this.props.onPress()
  }

  render() {
    let heading

    switch (this.props.transactionType) {
      case 'create-listing':
        heading = 'Create Listing'
        break
      case 'make-offer':
        heading = 'Purchase'
        break
      case 'publish-identity':
        heading = 'Publish Identity'
        break
      default:
        heading = 'Blockchain Transaction'
    }

    return (
      <View style={styles.card}>
        <Text style={styles.heading}>{heading}</Text>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Confirm'}
            onPress={this.handleEnable}
          />
        </View>
        <TouchableOpacity onPress={this.handleSkip}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(TransactionCard)

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  cancel: {
    color: '#1a82ff',
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  heading: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
})
