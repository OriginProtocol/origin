import dotenv from 'dotenv'
dotenv.config()

try {
  require('envkey')
} catch (error) {
  console.warn('EnvKey not configured')
}
