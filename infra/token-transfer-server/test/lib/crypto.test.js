const chai = require('chai')
const expect = chai.expect

const { encrypt, decrypt } = require('../../src/lib/crypto')

describe('Crypto', () => {
  it('Should encrypt and decrypt', () => {
    const data = 'I will be back'
    const encrypted = encrypt(data)
    const decrypted = decrypt(encrypted)
    expect(decrypted).to.equal(data)
  })
})
