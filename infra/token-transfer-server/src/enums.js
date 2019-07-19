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
  // Transfer requested by user.
  'Enqueued',
  // Transfer transaction sent to the network. Waiting for confirmation.
  'WaitingConfirmation',
  // Transfer successfully executed by the network.
  'Success',
  // Transfer transaction failed.
  'Failed',
  // Transfer cancelled by the user.
  'Cancelled'
)

module.exports = {
  TransferStatuses
}