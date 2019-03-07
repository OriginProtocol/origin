/*
'use strict';

import app from '../src/index'
import chai from 'chai'
import request from 'supertest'
import WebSocket from 'ws'

const expect = chai.expect

describe('API tests', () => {
  describe("Base path", () => {
    it ('should return Hellow World!', done => {
      request(app).get('/wallet-linker/').end((err, res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.text).to.equal("Hello World!")
        done()
      })
    })
    it ("Web socket connects", done => {
      const ws = new WebSocket("ws://localhost:3008/wallet-linker/")
      ws.on('open', () => {
        ws.on('message', message => {
          expect(message).to.equal("data")
          done()
        })
      })
    })
  })
})
*/
