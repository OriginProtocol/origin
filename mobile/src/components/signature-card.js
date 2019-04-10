import React, { Component } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import OriginButton from 'components/origin-button'

class SignatureCard extends Component {
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
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Signature Request</Text>
        <Text style={styles.content}>
          I agree to the Origin Rewards Terms & Conditions.
        </Text>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Sign'}
            onPress={this.handleSign}
          />
        </View>
        <TouchableOpacity onPress={this.handleCancel}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(SignatureCard)

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 20
  },
  cancel: {
    color: '#1a82ff',
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  content: {
    fontFamily: 'Lato',
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center'
  },
  heading: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  }
})
