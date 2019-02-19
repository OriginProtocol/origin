const chai = require('chai')
const ipfsdCtl = require('ipfsd-ctl')
const request = require('supertest')
const fs = require('fs')

const Logger = require('logplease')
Logger.setLogLevel('NONE')

const expect = chai.expect

// Known hashes for sample files
const ipfsHashes = {
  'sample.gif': 'QmQdXfnZihuWnBvWsGTC1XXXLukmVGUHfGhsiaxon1A5cK',
  'sample.png': 'QmfUkCVtuFr9nVRzbkorrVh3Yrkzsx1m8P43VhqQK5f5VG',
  'sample_1mb.jpg': 'QmcJwbSPxVgpLsnN3ESAeZ7FRSapYKa27pWFhY9orsZat7',
  'sample_5mb.jpg': 'QmSojSdiRtS1uC9T6HEVXjcUim62RZXfER8he9iCm2KTZJ',
  'sample.ico': 'QmYZMABAjEWpVfA8G68X64FECHDACaqPRqgry87sgFYm9y',
  'sample.json': 'QmaaAZU3raDoxhejCDDrvijvr9ev5dZ9GRXEDVnzykVxtD',
  'sample.html': 'QmV5yieTXnKmymahfms8Nq9VCBMAEMUL2X3PrNAAn86EYM'
}

describe('upload', () => {
  let server
  let ipfsFactory
  let ipfsd

  before(done => {
    server = require('./src/app')
    ipfsFactory = ipfsdCtl.create({
      type: 'js'
    })

    ipfsFactory.spawn(
      {
        disposable: true,
        defaultAddrs: true
      },
      (err, node) => {
        expect(err).to.be.null
        ipfsd = node
        done()
      }
    )
  })

  after(done => {
    server.close()
    ipfsd.stop(done)
  })

  it('should prevent uploads larger than size limit', done => {
    const image = './fixtures/sample_5mb.jpg'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(413, done)
  })

  it('should prevent uploads larger then size with fake content length', done => {
    const image = './fixtures/sample_5mb.jpg'
    request(server)
      .post('/api/v0/add')
      .set('Content-Length', 100)
      .attach('image', image)
      .expect(413, done)
  })

  it('should allow gif uploads', done => {
    const image = './fixtures/sample.gif'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow file uploads with query string', done => {
    const image = './fixtures/sample.gif'
    request(server)
      .post('/api/v0/add?stream-channels=true')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow png uploads', done => {
    const image = './fixtures/sample.png'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow jpg uploads', done => {
    const image = './fixtures/sample_1mb.jpg'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow ico uploads', done => {
    const image = './fixtures/sample.ico'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(200, done)
  })

  it('should allow json uploads', done => {
    const json = './fixtures/sample.json'
    request(server)
      .post('/api/v0/add')
      .attach('json', json)
      .expect(200, done)
  })

  it('should prevent svg uploads', done => {
    const image = './fixtures/sample.svg'
    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(415, done)
  })

  it('should prevent html uploads', done => {
    const html = './fixtures/sample.html'
    request(server)
      .post('/api/v0/add')
      .attach('html', html)
      .expect(415, done)
  })

  it('should deflate the content', done => {
    const image = './fixtures/sample_1mb.jpg'

    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .set('Accept-Encoding', 'deflate')
      .then(response => {
        expect(response.status).to.equal(200)
        expect(JSON.parse(response.text)['Hash']).to.equal(
          ipfsHashes['sample_1mb.jpg']
        )
        done()
      })
  })

  it('should gzip the content', done => {
    const image = './fixtures/sample_1mb.jpg'

    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .set('Accept-Encoding', 'gzip')
      .then(response => {
        expect(response.status).to.equal(200)
        expect(JSON.parse(response.text)['Hash']).to.equal(
          ipfsHashes['sample_1mb.jpg']
        )
        done()
      })
  })
})

describe('download', () => {
  let server
  let ipfsFactory
  let ipfsd

  before(done => {
    server = require('./src/app')

    ipfsFactory = ipfsdCtl.create({
      type: 'js'
    })

    ipfsFactory.spawn(
      {
        disposable: true,
        defaultAddrs: true
      },
      (err, node) => {
        expect(err).to.be.null
        ipfsd = node
        Promise.all([
          ipfsd.api.addFromFs('./fixtures/sample_1mb.jpg'),
          ipfsd.api.addFromFs('./fixtures/sample_5mb.jpg'),
          ipfsd.api.addFromFs('./fixtures/sample.gif'),
          ipfsd.api.addFromFs('./fixtures/sample.ico'),
          ipfsd.api.addFromFs('./fixtures/sample.json'),
          ipfsd.api.addFromFs('./fixtures/sample.png'),
          ipfsd.api.addFromFs('./fixtures/sample.html')
        ]).then(() => {
          done()
        })
      }
    )
  })

  after(done => {
    server.close()
    ipfsd.stop(done)
  })

  it('should allow gif downloads', done => {
    const fileBuffer = fs.readFileSync('./fixtures/sample.gif')
    request(server)
      .get(`/ipfs/${ipfsHashes['sample.gif']}`)
      .then(response => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('image/gif')
        expect(Buffer.compare(fileBuffer, response.body)).to.equal(0)
        done()
      })
  })

  it('should allow png downloads', done => {
    const fileBuffer = fs.readFileSync('./fixtures/sample.png')
    request(server)
      .get(`/ipfs/${ipfsHashes['sample.png']}`)
      .then(response => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('image/png')
        expect(Buffer.compare(fileBuffer, response.body)).to.equal(0)
        done()
      })
  })

  it('should allow jpg downloads', done => {
    const fileBuffer = fs.readFileSync('./fixtures/sample_1mb.jpg')

    request(server)
      .get(`/ipfs/${ipfsHashes['sample_1mb.jpg']}`)
      .then(response => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('image/jpeg')
        expect(Buffer.compare(fileBuffer, response.body)).to.equal(0)
        done()
      })
  })

  it('should allow json downloads', done => {
    const fileBuffer = fs.readFileSync('./fixtures/sample.json')
    request(server)
      .get(`/ipfs/${ipfsHashes['sample.json']}`)
      .then(response => {
        expect(response.status).to.equal(200)
        expect(response.text).to.equal(fileBuffer.toString())
        done()
      })
  })

  it('should prevent html downloads', done => {
    request(server)
      .get(`/ipfs/${ipfsHashes['sample.html']}`)
      .then(response => {
        expect(response.status).to.equal(415)
        done()
      })
  })

  /* TODO
  https://github.com/visionmedia/superagent/issues/1362
  it('should return an error on malformed request', done => {
  })
  */
})
