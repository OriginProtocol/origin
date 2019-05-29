'use strict'

import React from 'react'
import { Modal, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import get from 'lodash.get'

import { setBackupWarningStatus } from 'actions/Activation'
import BackupCard from 'components/backup-card'
import NavigationService from '../NavigationService'

class BackupPrompt extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      displayBackupModal: false
    }
  }

  async componentDidMount() {
    const { activation, wallet } = this.props
    const activeAddress = get(wallet.activeAccount, 'address', null)

    const hasBalance =
      Object.keys(wallet.accountBalance).find(currency => {
        return get(wallet.accountBalance, currency, 0) > 0
      }) !== undefined

    // Prompt that backup is required if balance was detected
    if (
      activeAddress &&
      hasBalance &&
      !activation.backupWarningDismissed[activeAddress]
    ) {
      this.setState({ displayBackupModal: true })
    }
  }

  render() {
    return this.state.displayBackupModal ? this.renderModal() : null
  }

  renderModal() {
    const { wallet } = this.props

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={true}
        onRequestClose={() => {
          this.setState({ displayBackupModal: false })
        }}
      >
        <SafeAreaView style={styles.svContainer}>
          <BackupCard
            wallet={this.props.wallet}
            onRequestBackup={async () => {
              await this.setState({ displayBackupModal: false })
              NavigationService.navigate('GuardedBackup')
            }}
            onRequestClose={async () => {
              await this.props.setBackupWarningStatus(
                wallet.activeAccount.address
              )
              this.setState({ displayBackupModal: false })
            }}
          />
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

const mapDispatchToProps = dispatch => ({
  setBackupWarningStatus: address => dispatch(setBackupWarningStatus(address))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BackupPrompt)

const styles = StyleSheet.create({
  svContainer: {
    flex: 1
  }
})
