require('dotenv').config()
const deploy = require('ipfs-deploy')
const fs = require('fs')
const { exec } = require('child_process')

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

  await deploy({
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

  await new Promise((resolve, reject) => {
    exec(`rm -rf public/${dataDir}`, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout)
    })
  })
}

go()
