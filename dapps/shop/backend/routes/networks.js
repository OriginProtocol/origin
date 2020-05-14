const { authSuperUser } = require('./_auth')
const { Network } = require('../models')
const { getConfig, setConfig } = require('../utils/encryptedConfig')
const startListener = require('../listener')
const omit = require('lodash/omit')
const pick = require('lodash/pick')

module.exports = function(app) {
  app.post('/networks', authSuperUser, async (req, res) => {
    const networkObj = {
      networkId: req.body.networkId,
      provider: req.body.provider,
      providerWs: req.body.providerWs,
      ipfs: req.body.ipfs,
      ipfsApi: req.body.ipfsApi,
      marketplaceContract: req.body.marketplaceContract,
      marketplaceVersion: req.body.marketplaceVersion,
      active: true,
      config: setConfig({
        pinataKey: req.body.pinataKey,
        pinataSecret: req.body.pinataSecret,
        cloudflareEmail: req.body.cloudflareEmail,
        cloudflareApiKey: req.body.cloudflareApiKey,
        domain: req.body.domain
      })
    }

    const existing = await Network.findOne({
      where: { networkId: networkObj.networkId }
    })
    if (existing) {
      await Network.update(networkObj, {
        where: { networkId: networkObj.networkId }
      })
    } else {
      await Network.create(networkObj)
    }

    startListener()

    res.json({ success: true })
  })

  app.get('/networks/:netId', authSuperUser, async (req, res) => {
    const where = { networkId: req.params.netId }
    const network = await Network.findOne({ where })
    if (!network) {
      return res.json({ success: false, reason: 'no-network' })
    }

    const config = getConfig(network.config)
    res.json({ ...omit(network.dataValues, 'config'), ...config })
  })

  app.put('/networks/:netId', authSuperUser, async (req, res) => {
    const where = { networkId: req.params.netId }
    const network = await Network.findOne({ where })
    if (!network) {
      return res.json({ success: false, reason: 'no-network' })
    }

    const config = pick(req.body, [
      'pinataKey',
      'pinataSecret',
      'cloudflareEmail',
      'cloudflareApiKey',
      'domain',
      'deployDir'
    ])

    const result = await Network.update(
      {
        config: setConfig(config, network.dataValues.config),
        ipfs: req.body.ipfs,
        ipfsApi: req.body.ipfsApi
      },
      { where }
    )

    if (!result || result[0] < 1) {
      return res.json({ success: false })
    }

    res.json({ success: true })
  })
}
