/* eslint-disable semi,no-unused-vars,no-extra-semi */
const { shouldBehaveLikeBurnableToken } = require('./BurnableToken.behaviour')
import { BurnableTokenMock } from '../../helpers/originTokenMocks'

contract('BurnableToken', function([owner]) {
  const initialBalance = 1000

  beforeEach(async function() {
    this.token = await BurnableTokenMock.new(owner, initialBalance)
  })

  shouldBehaveLikeBurnableToken([owner], initialBalance)
})
