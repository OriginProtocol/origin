const chai = require('chai')
const expect = chai.expect

const { generateInviteEmail } = require('../src/resources/email')

describe('Invite', () => {
  it(`Should generate email based on template`, () => {
    const name = 'George Lucas'
    const url = 'https://dapp.originprotocol.com/starwars'

    const { subject, text, html } = generateInviteEmail(name, url)

    expect(subject).to.be.a('string')
    expect(text).to.include(name)
    expect(text).to.include(url)
    expect(html).to.include(name)
    expect(html).to.include(url)
  })
})
