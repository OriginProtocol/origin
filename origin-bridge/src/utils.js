const web3 = require('web3')
const eth = require('web3-eth')
const OAuth = require('oauth').OAuth
const util = require('util')

// 128 words to map character codes to words
const words = [
  'surprise',
  'now',
  'mimic',
  'hood',
  'say',
  'glance',
  'there',
  'lava',
  'mimic',
  'crouch',
  'utility',
  'sorry',
  'address',
  'marine',
  'century',
  'wing',
  'farm',
  'citizen',
  'alone',
  'dentist',
  'knee',
  'bracket',
  'measure',
  'faith',
  'shine',
  'disagree',
  'hood',
  'slot',
  'spirit',
  'announce',
  'truly',
  'process',
  'response',
  'guard',
  'two',
  'connect',
  'assist',
  'ordinary',
  'raise',
  'muscle',
  'mistake',
  'festival',
  'mix',
  'flock',
  'puzzle',
  'ill',
  'border',
  'spy',
  'ozone',
  'uphold',
  'trumpet',
  'figure',
  'borrow',
  'topple',
  'wedding',
  'february',
  'above',
  'ordinary',
  'term',
  'nerve',
  'sure',
  'else',
  'hope',
  'submit',
  'ghost',
  'scatter',
  'limit',
  'above',
  'jewel',
  'bundle',
  'tail',
  'reform',
  'drama',
  'model',
  'stove',
  'bachelor',
  'kitchen',
  'combine',
  'swing',
  'trust',
  'mad',
  'segment',
  'affair',
  'forest',
  'grocery',
  'album',
  'subway',
  'concert',
  'aware',
  'bullet',
  'nominee',
  'juice',
  'oak',
  'sand',
  'toast',
  'celery',
  'noble',
  'giraffe',
  'bitter',
  'across',
  'federal',
  'clean',
  'catalog',
  'citizen',
  'street',
  'husband',
  'prefer',
  'term',
  'fun',
  'ranch',
  'entry',
  'install',
  'appear',
  'purse',
  'virtual',
  'improve',
  'sea',
  'ghost',
  'grant',
  'rule',
  'engage',
  'vicious',
  'struggle',
  'century',
  'nephew',
  'try',
  'vehicle',
  'crystal'
]

const twitterOAuth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0',
  getAbsoluteUrl('/redirects/twitter/'),
  'HMAC-SHA1'
)

function getTwitterOAuthRequestToken() {
  return new Promise((resolve, reject) => {
    twitterOAuth.getOAuthRequestToken(function(
      error,
      oAuthToken,
      oAuthTokenSecret
    ) {
      if (error) {
        reject(error)
      } else {
        resolve({ oAuthToken, oAuthTokenSecret })
      }
    })
  })
}

function getTwitterOAuthAccessToken(
  oAuthToken,
  oAuthTokenSecret,
  oAuthVerifier
) {
  return new Promise((resolve, reject) => {
    twitterOAuth.getOAuthAccessToken(
      oAuthToken,
      oAuthTokenSecret,
      oAuthVerifier,
      function(error, oAuthAccessToken, oAuthAccessTokenSecret) {
        if (error) {
          reject(error)
        } else {
          resolve({ oAuthAccessToken, oAuthAccessTokenSecret })
        }
      }
    )
  })
}

function verifyTwitterCredentials(oAuthAccessToken, oAuthAccessTokenSecret) {
  return new Promise((resolve, reject) => {
    twitterOAuth.get(
      'https://api.twitter.com/1.1/account/verify_credentials.json',
      oAuthAccessToken,
      oAuthAccessTokenSecret,
      function(error, response) {
        if (error) {
          reject(error)
        } else {
          resolve(JSON.parse(response).screen_name)
        }
      }
    )
  })
}

function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      if (err.status && err.response && err.response.text) {
        res.send({ status: err.status, data: JSON.parse(err.response.text) })
      }
      console.log(err)
      res.send('Error Occured While Trying to Fetch Third Party API')
    })
  }
}

function generateAirbnbCode(ethAddress, userId) {
  const hashCode = web3.utils.sha3(ethAddress + userId).substr(-7)
  console.log(hashCode)
  return Array.prototype.map
    .call(hashCode, i => words[i.charCodeAt(0)])
    .join(' ')
}

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000)
}

function getAbsoluteUrl(relativeUrl) {
  protocol = process.env.HTTPS ? 'https' : 'http'
  return protocol + '://' + process.env.HOST + relativeUrl
}

function mapObjectToQueryParams(obj) {
  return Object.keys(obj)
    .map(key => key + '=' + obj[key])
    .join('&')
}

function generateAttestationSignature(privateKey, subject, data) {
  if (!web3.utils.isHexStrict(privateKey)) {
    //TODO - Throw Error!
  }
  const hashToSign = web3.utils.soliditySha3(
    {
      t: 'address',
      v: web3.utils.toChecksumAddress(subject)
    },
    {
      t: 'bytes32',
      v: web3.utils.sha3(data)
    }
  )
  const signedMessage = new eth().accounts.sign(hashToSign, privateKey)
  return signedMessage.signature
}

module.exports = {
  generateAirbnbCode,
  generateSixDigitCode,
  getAbsoluteUrl,
  mapObjectToQueryParams,
  asyncMiddleware,
  generateAttestationSignature,
  twitterOAuth,
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
}
