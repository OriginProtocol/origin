const request = require('supertest')

describe('Upload', () => {
  let server

  beforeEach(() => {
    server = require('./src/index')
  })

  afterEach(() => {
    server.close()
  })

  it('should prevent uploads larger than size limit', (done) => {
    const image = '../fixtures/sample_5mb.jpg'

    request(server)
      .post('/api/v0/add')
      .attach('image', image)
      .expect(413, done)
  })

  it('should prevent uploads larger then size with fake content length', () => {
    const image = '../fixtures/sample_5mb.jpg'
  })

  it('should allow gif uploads', () => {
  })

  it('should allow png uploads', () => {
  })

  it('should allow jpg uploads', () => {
    const image = '../fixtures/sample_1mb.jpg'
  })

  it('should allow json uploads', () => {
  })

  it('should prevent svg uploads', () => {
  })

  it('should prevent binary uploads', () => {
  })
})

describe('Download', () => {
  it('should allow gif uploads', () => {
  })

  it('should allow png uploads', () => {
  })

  it('should allow jpg uploads', () => {
  })
})
