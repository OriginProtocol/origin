/* eslint-disable semi,no-unused-vars,no-extra-semi */
const { shouldBehaveLikeMintableToken } = require('./MintableToken.behaviour')
import { MintableTokenMock as MintableToken } from '../../helpers/originTokenMocks'

contract('MintableToken', function([owner, anotherAccount]) {
  const minter = owner

  beforeEach(async function() {
    this.token = await MintableToken.new({ from: owner })
  })

  shouldBehaveLikeMintableToken([owner, anotherAccount, minter])
})
