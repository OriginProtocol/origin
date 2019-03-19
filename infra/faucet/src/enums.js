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

const FaucetTxnStatuses = new Enum('Pending', 'Confirmed', 'Failed')

module.exports = { FaucetTxnStatuses }
