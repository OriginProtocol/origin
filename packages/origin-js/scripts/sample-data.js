const chalk = require('chalk')
const urllib = require('url')
const WORDLIST = require('./sample-words.json')
const Web3 = require('web3')
const Origin = require('../dist/index.js')

// This script creates randomly generated sample listings for testing purposes.
// Currently only written to run against local setup.

// 1) Create a couple of user accounts
// 2) Create a bunch of listings
// 3) Users make offers on other's listings

// Local Usage:
// scripts/sampleData.js <number of listings> <number of offers>
// docker exec -ti origin-js node scripts/sample-data.js 42 17

const NUMBER_OF_LISTINGS = parseInt(process.argv[2] || '30')
const NUMBER_OF_OFFERS = parseInt(process.argv[3] || NUMBER_OF_LISTINGS / 2)

const NAMES = [
  'Stan',
  'Micah',
  'Tyler',
  'Josh',
  'Daniel',
  'Matthew',
  'Kay',
  'Franck',
  '계룡/鷄龍',
  'Urist'
]
const CATEGORIES = {
  'schema.forSale': [
    'schema.forSale.artsCrafts',
    'schema.forSale.farmGarden',
    'schema.forSale.heavyEquipment',
    'schema.forSale.tickets'
  ],
  'schema.housing': [
    'schema.housing.aptsHousingForRent',
    'schema.housing.realEstate',
    'schema.housing.vacationRentals'
  ],
  'schema.services': [
    'schema.services.dogWalking',
    'schema.services.handyman',
    'schema.services.softwareDevelopement'
  ]
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomWord() {
  return randomPick(WORDLIST)
}

function randomTitleWord() {
  const word = randomWord()
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/*
 * Setup
 */

const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(web3Provider)
const ipfsUrl = urllib.parse('http://origin-js:8080')
const o = new Origin({
  ipfsDomain: ipfsUrl.hostname,
  ipfsGatewayProtocol: ipfsUrl.protocol.replace(':', ''),
  ipfsGatewayPort: ipfsUrl.port,
  web3
})

async function createSampleData() {
  /*
    * Create User Profiles 
    */
  const accounts = await web3.eth.getAccounts()
  const users = []
  for (const i in accounts) {
    const firstName = NAMES[i]
    const lastName = randomWord().toUpperCase()[0] + '.'
    const account = accounts[i]
    console.log(
      chalk`⬢  Creating user {bold.hex('#09f4a6') ${firstName} ${lastName}} ${account}`
    )
    o.contractService.web3.eth.defaultAccount = account
    if (Math.random() < 0.66) {
      console.log('    ...with profile')
      await o.users.set({
        profile: {
          firstName: firstName,
          lastName: lastName
        }
      })
    }
    users.push(await o.users.get(account))
  }

  /*
    * Create Listings 
    */
  const listings = []
  for (let i = 0; i < NUMBER_OF_LISTINGS; i++) {
    const brand = randomTitleWord()
      .toUpperCase()
      .replace(/[AEIOU]/, '')
    const listingName = `${brand} ${randomTitleWord()}`
    const user_i = Math.floor(Math.random() * users.length)
    const user = users[user_i]
    const userFirst = NAMES[user_i]
    o.contractService.web3.eth.defaultAccount = user.address
    const price = Math.floor(Math.pow(Math.random() * 10, 3.0)) / 100.0
    const commission = Math.floor(Math.random() * 20)
    const description = `${randomTitleWord()} is ${randomWord()}, ${randomWord()} ${randomWord()}.`
    const category = randomPick(Object.keys(CATEGORIES))
    const subCategory = randomPick(CATEGORIES[category])
    console.log(
      chalk` ⬢  Creating listing {bold.hex('#d408f4') ${listingName}} from {bold.hex('#09f4a6') ${userFirst}}`
    )
    try {
      const newListing = await o.marketplace.createListing({
        listingType: 'unit',
        title: listingName,
        category: category,
        subCategory: subCategory,
        language: 'en-US',
        description: description,
        price: { currency: 'ETH', amount: price.toString() },
        commission: { currency: 'OGN', amount: commission.toString() },
        unitsTotal: 1
      })
      listings.push(await o.marketplace.getListing(newListing.listingId))
    } catch (e) {
      console.log('Error creating a listing: ', e)
    }
  }

  /*
    * Create Offers
    */
  for (let i = 0; i < NUMBER_OF_OFFERS; i++) {
    const user_i = Math.floor(Math.random() * users.length)
    const user = users[user_i]
    const userFirst = NAMES[user_i]
    const listing = randomPick(listings)
    o.contractService.web3.eth.defaultAccount = user.address
    console.log(
      chalk`⬢  Creating offer from {bold.hex('#09f4a6') ${userFirst}} for {bold.hex('#d408f4') ${
        listing.title
      }}`
    )
    await o.marketplace.makeOffer(listing.id, {
      listingType: 'unit',
      unitsPurchased: 1,
      totalPrice: listing.price,
      commission: listing.commission
    })
  }

  console.log(chalk`{green -- Done -- }`)
}

createSampleData()
