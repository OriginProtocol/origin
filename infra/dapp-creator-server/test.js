const chai = require('chai')
const request = require('supertest')

const expect = chai.expect

describe('publish', () => {
  let server

  before(() => {
    server = require('./src/app')
  })

  it('should prevent blacklisted subdomains', () => {
    request(server)
      .post('/validate/subdomain')
      .send({
        subdomain: 'admin',
        address: '0x123'
      })
      .then(response => {
        expect(response.status).to.equal(400)
      })
  })
})
