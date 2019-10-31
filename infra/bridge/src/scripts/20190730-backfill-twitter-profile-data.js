'use strict'

const db = require('@origin/identity/src/models')
const logger = require('./../logger')

const { OAuth } = require('oauth')

// Note: Twitter rate-limits `users/lookup` endpoint at 300 requests per 15 minutes (for app tokens)
// Ref: https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-users-lookup
const API_INTERVAL = process.env.API_INTERVAL || 3000

const USERS_PER_REQUEST = process.env.USERS_PER_REQUEST || 100

const oAuthToken = process.env.TWITTER_ACCESS_TOKEN
const oAuthTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

const client = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_WEBHOOKS_CONSUMER_KEY || process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_WEBHOOKS_CONSUMER_SECRET ||
    process.env.TWITTER_CONSUMER_SECRET,
  '1.0',
  null,
  'HMAC-SHA1'
)

const waitFor = async timeInMs =>
  new Promise(resolve => setTimeout(() => resolve(true), timeInMs))

// Fetches all attestation that don't have a profile info filled in
const getAttestationsWithoutProfile = async () => {
  return await db.Attestation.findAll({
    where: {
      profileData: null,
      method: db.Attestation.AttestationTypes.TWITTER
    }
  })
}

// Returns the seconds in HH:mm format
const getFormattedTime = seconds =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`

const lookupUsers = screenNames => {
  return new Promise((resolve, reject) => {
    client.get(
      'https://api.twitter.com/1.1/users/lookup.json?screen_name=' +
        encodeURIComponent(screenNames.join(',')),
      oAuthToken,
      oAuthTokenSecret,
      (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(JSON.parse(response))
        }
      }
    )
  })
}

/*
 * Parse command line arguments into a dict.
 * @returns {Object} - Parsed arguments.
 */
// Copied from `infra/growth/src/util/args.js`
function parseArgv() {
  const args = {}
  for (const arg of process.argv) {
    const elems = arg.split('=')
    const key = elems[0]
    const val = elems.length > 1 ? elems[1] : true
    args[key] = val
  }
  return args
}

const args = parseArgv()
const dryRun = !!args['--dry-run']

;(async () => {
  logger.info(`Starting backfill script. DryRun mode=${dryRun}`)

  const startTime = Date.now()

  const attestations = await getAttestationsWithoutProfile()
  const iterations = Math.floor(attestations.length / USERS_PER_REQUEST) + 1

  let i = 0

  let successCounter = 0

  do {
    logger.info(
      `Estimated time to complete: ${getFormattedTime(3 * (iterations - i))}`
    )

    const startIndex = i * USERS_PER_REQUEST
    const screenNames = attestations
      .slice(startIndex, startIndex + USERS_PER_REQUEST)
      .map(attestation => {
        if (attestation.username) {
          return attestation.username
        }

        // For old twitter attestations, we will have the screen name in `value` field and `username` will be null
        // https://github.com/OriginProtocol/origin/commit/00f25f5fda75674c7888963496da6d641a0f05db#diff-8b4e2172b733ab5d1803f67ee70f51e6R38-R42
        return attestation.value
      })

    if (screenNames.length === 0) {
      // We are done
      break
    }

    try {
      const response = await lookupUsers(screenNames)

      response.forEach(async user => {
        if (dryRun) {
          return
        }
        logger.info(
          `Updating attestion for user ${user.id} / ${user.screen_name}`
        )
        await db.Attestation.update(
          {
            value: user.id,
            username: user.screen_name,
            profileUrl: `https://twitter.com/${user.screen_name}`,
            profileData: user
          },
          {
            where: {
              [db.Sequelize.Op.or]: [
                {
                  value: user.screen_name,
                  username: null
                },
                {
                  username: user.screen_name
                }
              ],
              method: db.Attestation.AttestationTypes.TWITTER
            }
          }
        )
      })

      logger.info(`Fetched profile info for ${screenNames.length} users`)

      logger.info(`Committed to DB`)

      successCounter = successCounter + screenNames.length
    } catch (error) {
      logger.error(`Error while fetching user data`, error)
    }

    i++
  } while (i < iterations && (await waitFor(API_INTERVAL)))

  const endTime = Date.now()

  logger.info()
  logger.info(
    `Total time taken: ${getFormattedTime((endTime - startTime) / 1000)}`
  )
  logger.info(`Fetched ${successCounter} profiles from Twitter`)

  logger.info(`Wrapping things up...`)
})()
  .then(() => {
    logger.info(`All done`)
    process.exit()
  })
  .catch(err => {
    logger.error(`Something went wrong :`, err)
    process.exit(1)
  })
