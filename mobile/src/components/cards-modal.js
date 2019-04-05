import React, { Component } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { connect } from 'react-redux'

import NotificationsCard from 'components/notifications-card'
import SignatureCard from 'components/signature-card'
import TransactionCard from 'components/transaction-card'

class CardsModal extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const { visible, onPress, onRequestClose } = this.props
    const transactionTypes = ['create-listing', 'make-offer', 'publish-identity']

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!visible}
        onRequestClose={() => {
          onRequestClose()
        }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.transparent} onPress={onPress}>
            {Math.random() >= 0.5 ? (
              <TransactionCard
                transactionType={transactionTypes[Math.floor(Math.random() * transactionTypes.length)]}
                onPress={onPress}
              />
            ) : Math.random() >= 0.5 ? (
              <NotificationsCard onPress={onPress} />
            ) : (
              <SignatureCard onPress={onPress} />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(CardsModal)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B18234C',
    flex: 1,
  },
  transparent: {
    flex: 1,
  },
})
