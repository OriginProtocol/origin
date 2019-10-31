/**
 * IMPORTANT: If you add an entry to an enum below, do not forget to add
 *  a migration script to add the enum to the DB.
 */

class Enum extends Array {
  constructor(...args) {
    super(...args)

    for (const k of args) {
      this[k] = k
    }
  }
}

const TransferStatuses = new Enum(
  // User has requested transfer but has not been confirmed by email token.
  'WaitingEmailConfirm',
  // Transfer requested by user.
  'Enqueued',
  // Request paused. For example for Origin staff to review the transfer before its exection.
  'Paused',
  // Transfer transaction sent to the network. Waiting for confirmation.
  'WaitingConfirmation',
  // Transfer successfully executed by the network.
  'Success',
  // Transfer transaction failed.
  'Failed',
  // Transfer cancelled by the user.
  'Cancelled',
  // Transfer was not confirmed by 2fa in the required time.
  'Expired'
)

const InvestorTypes = new Enum('Advisor', 'Strategic', 'CoinList')

module.exports = {
  InvestorTypes,
  TransferStatuses
}
