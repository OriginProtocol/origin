const puppeteer = require('puppeteer')
import { spawn } from 'child_process'
import services from '@origin/services'

import { changeAccount, clickByText } from './_helpers'

const headless = process.env.HEADLESS === 'false' ? false : true

let browser, page, webpackProcess, shutdownServices
before(async function() {
  shutdownServices = await services({
    ganache: { inMemory: true },
    deployContracts: true,
    ipfs: true,
    populate: true
  })

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
    slowMo: headless ? undefined : 40
  })
  page = (await browser.pages())[0]
  await page.goto('http://localhost:8083')
  console.log('Browser ready.\n')
})

after(async function() {
  if (browser) {
    await browser.close()
  }
  if (shutdownServices) {
    await shutdownServices()
  }
  if (webpackProcess) {
    webpackProcess.kill()
  }
})

describe('Marketplace Dapp', function() {
  it('should allow a new listing to be created', async function() {
    await changeAccount(page, '0xf17f52151EbEF6C7334FAD080c5704D77216b732')
    await clickByText(page, 'Add Listing')
    await clickByText(page, 'For Sale')
    await page.select('select', 'schema.clothingAccessories')
    await clickByText(page, 'Continue')
    await page.type('input[name=title]', 'T-Shirt')
    await page.type('textarea[name=description]', 'T-Shirt in size large')
    await page.type('input[name=price]', '0.01')
    await clickByText(page, 'Continue')
    await clickByText(page, 'Review')
    await clickByText(page, 'Done')
    await clickByText(page, 'View Listing')
  })

  it('should allow a new listing to be purchased', async function() {
    await changeAccount(page, '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef')
    await clickByText(page, 'Purchase')
    await clickByText(page, 'View Purchase')
  })
})
