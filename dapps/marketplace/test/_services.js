/**
 * This file should be run before all other tests, which can be done by passing
 * the --file option to mocha. It sets up and tears down the infrastructure
 * (ethereum test node and IPFS) required to run tests.
 */

const puppeteer = require('puppeteer')
import { spawn } from 'child_process'
import services from '@origin/services'

const headless = process.env.HEADLESS === 'false' ? false : true

export default async function() {
  return await services({
    ganache: { inMemory: true },
    ipfs: true,
    populate: true,
    deployContracts: true,
    contractsFile: 'tests',
    extras: async () => {
      const webpackProcess = spawn(
        './node_modules/.bin/webpack-dev-server',
        ['--port=8083', '--host=0.0.0.0', '--no-info', '--progress'],
        {
          stdio: 'inherit',
          env: process.env
        }
      )
      process.on('exit', () => webpackProcess.kill())

      await new Promise(resolve => setTimeout(resolve, 5000))

      const browser = await puppeteer.launch({
        headless,
        defaultViewport: {
          width: 1280,
          height: 1024
        }
        // slowMo: headless ? undefined : 40
      })

      const pages = await browser.pages()
      const page = pages[0]

      await page.goto('http://localhost:8083')
      await page.evaluate(
        () =>
          new Promise(resolve => {
            window.transactionPoll = 100
            // window.localStorage.locale = 'zh_CN'
            resolve()
          })
      )

      return { page, browser, webpackProcess }
    }
  })
}
