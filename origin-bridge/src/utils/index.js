const web3 = require('web3')
const OAuth = require('oauth').OAuth
const dictionary = require('./dictionary')

function twitterOAuth(dappRedirectUrl = null) {
  return new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    '1.0',
    getAbsoluteUrl('/redirects/twitter/', dappRedirectUrl),
    'HMAC-SHA1'
  )
}

function getTwitterOAuthRequestToken(dappRedirectUrl) {
  return new Promise((resolve, reject) => {
    twitterOAuth(dappRedirectUrl).getOAuthRequestToken(function(
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
    twitterOAuth().getOAuthAccessToken(
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
    twitterOAuth().get(
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
  return Array.prototype.map
    .call(hashCode, i => dictionary[i.charCodeAt(0)])
    .join(' ')
}

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000)
}

function getAbsoluteUrl(relativeUrl, dappRedirectUrl = null) {
  const protocol = process.env.HTTPS ? 'https' : 'http'
  let url = protocol + '://' + process.env.HOST + relativeUrl
  if (dappRedirectUrl) {
    url += '?dappRedirectUrl=' + dappRedirectUrl
  }
  return url
}

function mapObjectToQueryParams(obj) {
  return Object.keys(obj)
    .map(key => key + '=' + obj[key])
    .join('&')
}

module.exports = {
  generateAirbnbCode,
  generateSixDigitCode,
  getAbsoluteUrl,
  mapObjectToQueryParams,
  asyncMiddleware,
  twitterOAuth,
  getTwitterOAuthRequestToken,
  getTwitterOAuthAccessToken,
  verifyTwitterCredentials
}
