/*
 * Implementation of the Origin Growth GraphQL server.
 * Uses the Apollo framework: https://www.apollographql.com/server
 */
const logger = require('../logger')
require('dotenv').config()

try {
  require('envkey')
} catch (error) {
  logger.log('EnvKey not configured')
}

const { getUserAuthStatusAndToken } = require('../resources/authentication')

const { ApolloServer } = require('apollo-server-express')
const cors = require('cors')
const express = require('express')
const promBundle = require('express-prom-bundle')

const enums = require('../enums')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const { validateToken } = require('@origin/auth-utils/src/index')

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
  // Enable debug regardless of NODE_ENV value in order to include stack traces in errors.
  debug: true,
  // Error handler that writes to the server logs.
  formatError: err => {
    logger.error(JSON.stringify(err, null, 4))
    return err
  },
  // Always enable GraphQL playground and schema introspection, regardless of NODE_ENV value.
  introspection: true,
  playground: true,
  context: async context => {
    const headers = context.req.headers

    let authStatus = enums.GrowthParticipantAuthenticationStatus.NotEnrolled
    let authToken,
      walletAddress,
      identityOverriden = false

    let authorized = false

    if (headers['x-growth-secret'] && headers['x-growth-wallet']) {
      if (headers['x-growth-secret'] === process.env.GROWTH_ADMIN_SECRET) {
        // Grant admin access.
        authToken = 'AdminToken'
        identityOverriden = true
        walletAddress = headers['x-growth-wallet'].toLowerCase()
        authStatus = enums.GrowthParticipantAuthenticationStatus.Enrolled
      } else {
        logger.error('Invalid admin secret')
      }
    } else if (headers.authorization) {
      const { success, authData } = await validateToken(context.req)

      if (success) {
        try {
          const status = await getUserAuthStatusAndToken(authData.address)

          authStatus = status.authStatus
          authToken = status.authToken

          authorized = true
          walletAddress = authData.address.toLowerCase()
        } catch (e) {
          logger.error(
            'Authorization header present but unable to authenticate user',
            e.message,
            e.stack
          )
        }
      }
    }

    return {
      ...context,
      authToken,
      identityOverriden,
      walletAddress,
      authentication: authStatus,
      authorized
    }
  }
})

server.applyMiddleware({ app })

const port = process.env.PORT || 4008

app.listen({ port: port }, () =>
  logger.info(
    `Apollo server ready at http://localhost:${port}${server.graphqlPath}`
  )
)
