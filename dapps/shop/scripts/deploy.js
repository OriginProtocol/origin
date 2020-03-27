require('dotenv').config()
const deploy = require('ipfs-deploy')
const fs = require('fs')
const { exec } = require('child_process')
const Bottleneck = require('bottleneck')
const https = require('https')
const { resolve } = require('path')

const limiter = new Bottleneck({ maxConcurrent: 10 })
const { readdir } = fs.promises

const dataDir = process.argv[2]
if (!dataDir) {
  console.log('Usage: node deploy.js [data_dir]')
  process.exit()
}
if (!fs.existsSync(`${__dirname}/../data/${dataDir}`)) {
  console.log(`data/${dataDir} not found`)
  process.exit()
}

if (!process.env.PINATA_KEY) {
  console.log('No PINATA_KEY in .env')
  process.exit()
}

if (!process.env.PINATA_SECRET) {
  console.log('No PINATA_SECRET in .env')
  process.exit()
}

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFiles(res) : res
    })
  )
  return Array.prototype.concat(...files)
}

async function download(url) {
  await new Promise(resolve => {
    const f = fs.createWriteStream('/dev/null').on('finish', resolve)
    console.log(`Priming ${url}`)
    https.get(url, response => response.pipe(f))
  })
}

async function prime(urlPrefix) {
  const filesWithPath = await getFiles(`${__dirname}/../public`)
  const files = filesWithPath.map(f => f.split('public/')[1])
  for (const file of files) {
    const url = `${urlPrefix}/${file}`
    limiter.schedule(url => download(url), url)
  }
}

async function go() {
  await new Promise((resolve, reject) => {
    exec(`rm -rf public/${dataDir}`, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout)
    })
  })
  await new Promise((resolve, reject) => {
    exec(`cp -r data/${dataDir} public/${dataDir}`, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout)
    })
  })

  const hash = await deploy({
    remotePinners: ['pinata'],
    // dnsProviders: argv.dns,
    siteDomain: dataDir,
    credentials: {
      // cloudflare: {
      //   apiKey: argv.cloudflare && argv.cloudflare.apiKey,
      //   apiToken: argv.cloudflare && argv.cloudflare.apiToken,
      //   apiEmail: argv.cloudflare && argv.cloudflare.apiEmail,
      //   zone: argv.cloudflare && argv.cloudflare.zone,
      //   record: argv.cloudflare && argv.cloudflare.record
      // },
      pinata: {
        apiKey: process.env.PINATA_KEY,
        secretApiKey: process.env.PINATA_SECRET
      }
    }
  })

  await prime(`https://gateway.pinata.cloud/ipfs/${hash}`)
  await prime(`https://gateway.ipfs.io/ipfs/${hash}`)
  await prime(`https://ipfs-prod.ogn.app/ipfs/${hash}`)

  await new Promise((resolve, reject) => {
    exec(`rm -rf public/${dataDir}`, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout)
    })
  })
}

go()
