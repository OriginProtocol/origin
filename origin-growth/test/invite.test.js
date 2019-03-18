const chai = require('chai')
const expect = chai.expect

const { generateEmail } = require('../src/resources/email')

describe('Invite', () => {
  it(`Should generate email based on template`, () => {
    const name = 'George Lucas'
    const url = 'https://dapp.originprotocol.com/starwars'

    for (const type of ['invite', 'reminder']) {
      const { subject, text, html } = generateEmail(type, name, url)

      expect(subject).to.be.a('string')
      expect(text).to.include(name)
      expect(text).to.include(url)
      expect(html).to.include(name)
      expect(html).to.include(url)
    }
  })
})
