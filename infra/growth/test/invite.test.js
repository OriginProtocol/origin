const chai = require('chai')
const expect = chai.expect

const { generateEmail } = require('../src/resources/email')

describe('Emails', () => {
  it(`Should generate invite and reminder emails based on template`, () => {
    const vars = {
      referrerName: 'George Lucas',
      targetUrl: 'https://shoporigin.com/starwars'
    }

    for (const type of ['invite', 'reminder']) {
      const { subject, text, html } = generateEmail(type, vars)
      expect(subject).to.be.a('string')
      expect(text).to.include(vars.referrerName)
      expect(text).to.include(vars.targetUrl)
      expect(html).to.include(vars.referrerName)
      expect(html).to.include(vars.targetUrl)
    }
  })

  it(`Should generate payout email based on template`, () => {
    const vars = {
      amount: 1973,
      ethAddress: '0x123ABC',
      txLink: 'https://txLink.fr',
      campaignLink: 'https://campaignLink.fr'
    }

    const { subject, text, html } = generateEmail('payout', vars)
    expect(subject).to.be.a('string')
    expect(text).to.include(vars.amount)
    expect(text).to.include(vars.ethAddress)
    expect(text).to.include(vars.txLink)
    expect(text).to.include(vars.campaignLink)
    expect(html).to.include(vars.amount)
    expect(html).to.include(vars.ethAddress)
    expect(html).to.include(vars.txLink)
    expect(html).to.include(vars.campaignLink)
  })
})
