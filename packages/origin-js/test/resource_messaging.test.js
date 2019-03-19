import Messaging from '../src/resources/messaging'

import Web3 from 'web3'
import contractServiceHelper from './helpers/contract-service-helper'
import { validateMessaging } from './helpers/schema-validation-helper'

describe('Messaging Resource', function() {
  let web3, contractService, messaging, ipfsCreator, OrbitDB, ecies, messagingNamespace
  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    web3 = new Web3(provider)
    // these should be all mocked
    ipfsCreator = new Object()
    OrbitDB = new Object()
    ecies = new Object()
    messagingNamespace = 'messaging_test'
    contractService = await contractServiceHelper(web3)
    messaging = new Messaging({
      contractService,
      ipfsCreator,
      OrbitDB,
      ecies,
      messagingNamespace
    })
  })

  describe('init', () => {
    it('should be instantiated', () => {
      validateMessaging(messaging)
    })
  })
})
