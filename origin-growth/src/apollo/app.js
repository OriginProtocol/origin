/*
 * Implementation of the Origin Growth GraphQL server.
 * Uses the Apollo framework: https://www.apollographql.com/server
 */
const logger = require('../logger')
require('dotenv').config()

const {
  getUserAuthenticationStatus,
  getUser
} = require('../resources/authentication')

try {
  require('envkey')
} catch (error) {
  logger.log('EnvKey not configured')
}

const { ApolloServer } = require('apollo-server-express')
const cors = require('cors')
const express = require('express')
const promBundle = require('express-prom-bundle')

const enums = require('../enums')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const app = express()
app.use(cors())

const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
app.use(bundle)

// Start ApolloServer by passing type definitions and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  resolvers,
  typeDefs,
  // Always enable GraphQL playground and schema introspection, regardless of NODE_ENV value.
  introspection: true,
  playground: true,
  context: async context => {
    let countryCode = null
    const headers = context.req.headers

    logger.debug('Received request headers: ', JSON.stringify(headers))
    /* TODO: this needs to be tested on production that google rightly sets X-AppEngine-Country
     */
    if (headers) {
      countryCode = headers['X-AppEngine-Country'] || null
    }

    let authStatus = enums.GrowthParticipantAuthenticationStatus.NotEnrolled
    let authToken, walletAddress
    if (headers.authentication) {
      try {
        authToken = JSON.parse(headers.authentication).growth_auth_token
        authStatus = await getUserAuthenticationStatus(authToken)

        walletAddress = (await getUser(authToken)).ethAddress
      } catch (e) {
        logger.error(
          'Authentication header present but unable to authenticate user ',
          e.message,
          e.stack
        )
      }
    }

    return {
      ...context,
      countryCode,
      authToken,
      walletAddress,
      authentication: authStatus
    }
  }
})

server.applyMiddleware({ app })

const port = process.env.PORT || 4001

app.listen({ port: port }, () =>
  logger.info(
    `Apollo server ready at http://localhost:${port}${server.graphqlPath}`
  )
)
