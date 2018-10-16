const chai = require('chai')
const ipfsdCtl = require('ipfsd-ctl')
const request = require('supertest')
const logger = require('./src/logger')

const expect = chai.expect
const ipfsPort = 9998

describe('upload', () => {
  let server
  let ipfsServer
  let ipfsFactory
  let ipfsd

  beforeEach((done) => {
    server = require('./src/index')
    ipfsFactory = ipfsdCtl.create({
      type: 'js',
    })

    ipfsFactory.spawn({
      disposable: true,
      defaultAddrs: true
    }, (err, node) => {
      expect(err).to.be.null
      ipfsd = node
      done()
    })
  })

  afterEach((done) => {
    server.close()
    ipfsd.stop(done)
  })

  it('should prevent uploads larger than size limit', (done) => {
    const image = './fixtures/sample_5mb.jpg'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(413, done)
  })

  it('should prevent uploads larger then size with fake content length', (done) => {
    const image = './fixtures/sample_5mb.jpg'
    request(server)
      .post('/api/v0/add')
      .set('Content-Length', 100)
      .attach('image', image)
      .expect(413, done)
  })

  it('should allow gif uploads', (done) => {
    const image = './fixtures/sample.gif'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow png uploads', (done) => {
    const image = './fixtures/sample.png'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow jpg uploads', (done) => {
    const image = './fixtures/sample_1mb.jpg'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow json uploads', (done) => {
    const json = './fixtures/sample.json'
    request(server)
      .post('/api/v0/add')
      .attach('json', json)
      .expect(200, done)
  })

  it('should prevent svg uploads', (done) => {
    const image = './fixtures/sample.svg'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(415, done)
  })

  it('should prevent binary uploads', () => {
  })
})

describe('download', () => {
  let server

  beforeEach(() => {
    server = require('./src/index')
  })

  afterEach(() => {
    server.close()
  })

  it('should allow gif downloads', (done) => {
    done()
  })

  it('should allow png downloads', (done) => {
    done()
  })

  it('should allow jpg downloads', (done) => {
    done()
  })
})
