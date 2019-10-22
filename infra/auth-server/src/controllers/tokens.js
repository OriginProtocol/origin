const express = require('express')
const router = express.Router()

const verifySign = require('../utils/verify-sign')
const generateToken = require('../utils/generate-token')

router.post('/', (req, res) => {
  const { payload, signature, address } = req.body

  const validSign = verifySign({
    address,
    payload,
    signature
  })

  if (!validSign) {
    // It is invalid sign
    return res.status(400).send({
      success: false,
      errors: ['Failed to verify signature']
    })
  }

  const authToken = generateToken({
    address,
    signature,
    payload
  })

  return res.status(201).send({
    success: true,
    authToken
  })
})

module.exports = router
