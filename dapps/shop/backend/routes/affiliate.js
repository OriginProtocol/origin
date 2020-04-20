const { authShop } = require('./_auth')
const util = require('ethereumjs-util')
const dayjs = require('dayjs')

const { Order } = require('../models')

function authAffiliate(req, res, next) {
  try {
    const sig = util.fromRpcSig(Buffer.from(req.body.sig.slice(2), 'hex'))
    const msg = util.hashPersonalMessage(Buffer.from(req.body.msg))
    const pubKey = util.ecrecover(msg, sig.v, sig.r, sig.s)
    const addrBuf = util.pubToAddress(pubKey)
    const account = util.bufferToHex(addrBuf)
    req.affiliate = account

    const [, date] = req.body.msg.split('OGN Affiliate Login ')
    const dateOk = dayjs(date).isAfter(dayjs().subtract(1, 'day'))
    if (!dateOk) {
      return res.json({ authed: false })
    }
  } catch (e) {
    return res.json({ authed: false })
  }
  next()
}

module.exports = function(app) {
  app.post('/affiliate/login', authShop, authAffiliate, async (req, res) => {
    res.json({ authed: true, account: req.affiliate })
  })

  app.post('/affiliate/earnings', authShop, authAffiliate, async (req, res) => {
    const orders = await Order.findAll({
      where: { shopId: req.shop.id, referrer: req.affiliate }
    })

    const results = {
      pendingOrders: 0,
      completedOrders: 0,
      commissionPending: 0,
      commissionPaid: 0
    }

    orders.forEach(order => {
      if (order.statusStr === 'OfferFinalized') {
        results.completedOrders += 1
      } else {
        results.pendingOrders += 1
      }
      results.commissionPending += order.commissionPending
      results.commissionPaid += order.commissionPaid
    })

    res.send(results)
  })
}
