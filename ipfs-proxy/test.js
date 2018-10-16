const chai = require('chai')
const ipfsdCtl = require('ipfsd-ctl')
const request = require('supertest')
const logger = require('./src/logger')

const expect = chai.expect
const ipfsPort = 9998
const ipfsHashes = {
  'sample.gif': 'QmQdXfnZihuWnBvWsGTC1XXXLukmVGUHfGhsiaxon1A5cK',
  'sample.png': 'QmfUkCVtuFr9nVRzbkorrVh3Yrkzsx1m8P43VhqQK5f5VG',
  'sample_1mb.jpg': 'QmcJwbSPxVgpLsnN3ESAeZ7FRSapYKa27pWFhY9orsZat7',
  'sample_5mb.jpg': 'QmSojSdiRtS1uC9T6HEVXjcUim62RZXfER8he9iCm2KTZJ',
  'sample.json': 'QmPc1WfXnWDxQreha2fr1aXskmjJ7PSiKXs6Er726kGy2R'
}

describe('upload', () => {
  let server
  let ipfsFactory
  let ipfsd

  before((done) => {
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

  after((done) => {
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
    const res = request(server)
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
  let ipfsFactory
  let ipfsd

  before((done) => {
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
      ipfsd.api.util.addFromFs('./fixtures/sample_1mb.jpg')
      ipfsd.api.util.addFromFs('./fixtures/sample_5mb.jpg')
      ipfsd.api.util.addFromFs('./fixtures/sample.gif')
      ipfsd.api.util.addFromFs('./fixtures/sample.json')
      ipfsd.api.util.addFromFs('./fixtures/sample.png')
      done()
    })
  })

  after((done) => {
    server.close()
    ipfsd.stop(done)
  })

  it('should allow gif downloads', (done) => {
    request(server)
      .get(`/ipfs/${ipfsHashes['sample.gif']}`)
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('image/gif')
        done()
      })
  })

  it('should allow png downloads', (done) => {
    request(server)
      .get(`/ipfs/${ipfsHashes['sample.png']}`)
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('image/png')
        done()
      })
  })

  it('should allow jpg downloads', (done) => {
    request(server)
      .get(`/ipfs/${ipfsHashes['sample_1mb.jpg']}`)
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('image/jpeg')
        done()
      })
  })

  it('should allow json downloads', (done) => {
    request(server)
      .get(`/ipfs/${ipfsHashes['sample.json']}`)
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('application/json')
        done()
      })
  })
})
