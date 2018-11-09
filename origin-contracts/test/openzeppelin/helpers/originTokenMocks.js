const OriginToken = artifacts.require('OriginToken')

export const StandardTokenMock = {
  new: async function(owner, initialSupply) {
    return await OriginToken.new(initialSupply, { from: owner })
  }
}

export const BasicTokenMock = StandardTokenMock

export const BurnableTokenMock = StandardTokenMock

export const MintableTokenMock = {
  new: async function(opts) {
    return await OriginToken.new(0, opts)
  }
}

export const PausableTokenMock = StandardTokenMock
