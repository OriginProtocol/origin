const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const express = require('express')

const { Account, User } = require('../../src/models')

process.env.SENDGRID_FROM_EMAIL = 'test@test.com'
process.env.SENDGRID_API_KEY = 'test'
process.env.ENCRYPTION_SECRET = 'test'
process.env.SESSION_SECRET = 'test'

const app = require('../../src/app')

describe('account api', () => {
  beforeEach(async () => {
    await User.create({
      id: 1,
      email: 'user@originprotocol.com'
    })

    this.mockApp = express()
    this.mockApp.use((req, res, next) => {
      req.session = {
        email: 'user@originprotocol.com',
        twoFA: 'Yep'
      }
      next()
    })
    this.mockApp.use(app)

    // Cleanup
    User.destroy({
      where: {},
      truncate: true
    })

    Account.destroy({
      where: {},
      truncate: true
    })
  })

  it('should add an account', async () => {
    const nickname = 'test',
      address = '0x0000000000000000000000000000000000000000'

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ nickname, address })
      .expect(200)

    expect(response.body.nickname).to.equal(nickname)
    expect(response.body.address).to.equal(address)

    const results = Account.findAll()
    expect(results.length).to.equal(1)
    expect(results[0].nickname).to.equal(nickname)
    expect(results[0].address).to.equal(address)
  })

  it('should error on adding account with missing eth address', async () => {
    const nickname = 'test'

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ nickname })
      .expect(422)
  })

  it('should error on adding account with invalid eth address', async () => {
    const nickname = 'test',
      address = 'donkey'

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ nickname, address })
      .expect(422)
  })

  it('should error on adding account with duplicate eth address', async () => {
    const nickname = 'test',
      address = '0x0000000000000000000000000000000000000000'

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ nickname, address })
      .expect(200)

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ nickname: 'test2', address })
      .expect(422)
  })

  it('should error on adding account with missing nickname', async () => {
    const address = '0x0000000000000000000000000000000000000000'

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ address })
      .expect(422)
  })

  it('should error on adding account with duplicate nickname', async () => {
    const nickname = 'test',
      address = '0x0000000000000000000000000000000000000000'

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ nickname, address })
      .expect(200)

    await request(this.mockApp)
      .post('/api/accounts')
      .send({ nickname, address: '0x001' })
      .expect(422)
  })

  it('should return no accounts before any are added', () => {
  })

  it('should return one account after one is added', () => {
  })

  it('should not return other users account', () => {
  })

  it('should edit an account', () => {
  })

  it('should not edit other users account', () => {
  })

  it('should delete an account', () => {
  })

  it('should not delete other users account', () => {
  })
})
