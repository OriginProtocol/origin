const chalk = require('chalk')
const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')
const args = process.argv.slice(2)
const noGanache = args.length && args[0] === 'no-ganache'
const Web3 = require('web3')
const Origin = require('../src/index.js')

const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(web3Provider)
const ipfsUrl = urllib.parse('http://origin-js:8080')
const o = new Origin({
  ipfsDomain: ipfsUrl.hostname,
  ipfsGatewayProtocol: ipfsUrl.protocol.replace(':', ''),
  ipfsGatewayPort: ipfsUrl.port,
  web3
})


const start = async () => {
  if (!noGanache) {
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Local Blockchain }\n`)
    await startGanache()
  }
  console.log(chalk`\n{bold.hex('#26d198') ⬢  Deploying Smart Contracts }\n`)
  await deployContracts()
  console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Starting Local IPFS }\n`)
  await startIpfs()
}

const createSamples = async() => {

  //hawai-house
  await o.marketplace.createListing({
    listingType: 'unit',
    category: 'schema.forRent',
    subCategory: 'schema.housing',
    language: 'en-US',
    title: 'Mamalahoa Estate',
    description: "Built on the slopes of Hualalai Mountain in Kailua, Hawaii, the Mamalahoa Estate knows how to make a first impression. You enter the property through a grove of citrus and macadamia trees. A floating walkway takes you across a koi pond, surrounded by lush greenery and a waterfall. Once inside, the 5,391-square-foot home is comprised of a master and two guest suites, each with a private staircase leading down to the garden courtyard. A chef's kitchen with koa cabinetry looks onto a double-height living area. Flanked by sliding doors, the room opens to a veranda that overlooks two swimming pools and the Kona coastline. Consisting of 90 acres, the grounds also feature a driving range, tennis court, bocce courts, and a three-car garage.",
    unitsTotal: 1,
    price: {
      currency: 'ETH',
      amount: '8.5'
    },
    commission: {
      currency: 'OGN',
      amount: '10'
    }
  })

  // lake-house
  await o.marketplace.createListing({
    listingType: 'unit',
    category: 'schema.forRent',
    subCategory: 'schema.housing',
    language: 'en-US',
    title: 'Casa Wolf',
    description: "Overlooking Lake Llanquihue, Casa Wulf is inspired by the terrain. The home sits on a steep slope. This lead to its three-story design, creating a natural balcony facing the water. Among the levels, the main living area is at the center, with the bedrooms above and a basement workshop below. Each floor was constructed using a different system, resulting in a range of facades. Their orientation takes advantage of the incoming sunlight and while also exposing the interiors to the surrounding landscape.",
    unitsTotal: 1,
    price: {
      currency: 'ETH',
      amount: '1.5'
    },
    commission: {
      currency: 'OGN',
      amount: '10'
    }
  })

  // scout
  await o.marketplace.createListing({
    listingType: 'unit',
    category: 'schema.forSale',
    subCategory: 'schema.carsTrucks',
    language: 'en-US',
    title: '1977 International Scout II',
    description: "Introduced in 1971, the International Scout II rode on a stretched-wheelbase version of the rugged Scout chassis as a competitor to trucks like the larger Chevrolet Blazer. The highly customizable Scout was popular for work and racing, taking home a class win in the 1977 Baja 1000. This restored beautifully restored 1977 Scout II's customizations run more than skin deep, with a 6.0-liter GM engine and transmission to go along with the wheels and suspension lift.",
    unitsTotal: 1,
    price: {
      currency: 'ETH',
      amount: '0.6'
    },
    commission: {
      currency: 'OGN',
      amount: '10'
    }
  })

  // taylor-swioft-tix
  await o.marketplace.createListing({
    listingType: 'unit',
    category: 'schema.forSale',
    subCategory: 'schema.tickets',
    language: 'en-US',
    title: "Taylor Swift's Reputation Tour",
    description: "Taylor Swift's Reputation Stadium Tour is the fifth world concert tour by American singer-songwriter Taylor Swift, in support of her sixth studio album, Reputation.",
    unitsTotal: 1,
    price: {
      currency: 'ETH',
      amount: '0.3'
    },
    commission: {
      currency: 'OGN',
      amount: '10'
    }
  })

  // zinc-house
  await o.marketplace.createListing({
    listingType: 'unit',
    category: 'schema.forRent',
    subCategory: 'schema.housing',
    language: 'en-US',
    title: 'Zinc House',
    description: "Overlooking Lake Llanquihue, Casa Wulf is inspired by the terrain. The home sits on a steep slope. This lead to its three-story design, creating a natural balcony facing the water. Among the levels, the main living area is at the center, with the bedrooms above and a basement workshop below. Each floor was constructed using a different system, resulting in a range of facades. Their orientation takes advantage of the incoming sunlight and while also exposing the interiors to the surrounding landscape.",
    unitsTotal: 1,
    price: {
      currency: 'ETH',
      amount: '3.999'
    },
    commission: {
      currency: 'OGN',
      amount: '10'
    }
  })
}

start()
createSamples()
