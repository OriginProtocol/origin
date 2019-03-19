import logger from './logger'

require('dotenv').config()

try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured')
}
