/**
 * This file should be run before all other tests, which can be done by passing
 * the --file option to mocha. It sets up and tears down the infrastructure
 * (ethereum test node and IPFS) required to run tests.
 */

const puppeteer = require('puppeteer')
import { spawn } from 'child_process'
import services from '@origin/services'

const headless = process.env.HEADLESS === 'false' ? false : true
const isWatchMode = process.argv.some(arg => arg === '-w' || arg === '--watch')

let browser, webpackProcess, shutdownServices

before(async function() {
  this.timeout(30000)

  shutdownServices = await services({
    ganache: { inMemory: true },
    ipfs: true,
    populate: true,
    extras: async () => {
      webpackProcess = spawn(
        './node_modules/.bin/webpack-dev-server',
        ['--port=8083', '--host=0.0.0.0', '--no-info', '--progress'],
        {
          stdio: 'inherit',
          env: process.env
        }
      )
      process.on('exit', () => webpackProcess.kill())

      await new Promise(resolve => setTimeout(resolve, 5000))

      browser = await puppeteer.launch({
        headless,
        defaultViewport: {
          width: 1280,
          height: 1024
        },
        // slowMo: headless ? undefined : 40
      })

      const pages = await browser.pages()
      global.page = pages[0]

      console.log('Browser ready.\n')
    }
  })

  await global.page.goto('http://localhost:8083')
  await global.page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  await global.page.reload()
  await global.page.evaluate(
    () =>
      new Promise(resolve => {
        window.populate(log => console.log(log), resolve)
        window.localStorage.useWeb3Wallet =
          '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
      })
  )
  await global.page.reload()
})

after(async function() {
  if (!isWatchMode) {
    if (browser) {
      await browser.close()
    }
    if (shutdownServices) {
      await shutdownServices()
    }
    if (webpackProcess) {
      webpackProcess.kill()
    }
  }
})
