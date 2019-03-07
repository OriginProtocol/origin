'use strict'

require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  console.warn('ENVKEY not configured')
}
