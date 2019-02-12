//const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date')
const db = require('./db')
const { getLocationInfo } = require('../util/locationInfo')

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  /* TODO:
   * Use this pagination helpers when implementing pagination:
   * https://github.com/OriginProtocol/origin/blob/master/experimental/origin-graphql/src/resolvers/_pagination.js
   */
  //JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
  Query: {
    async campaigns () {
      const campaigns = await db.getCampaigns()
      return {
        totalCount: campaigns.length,
        nodes: await db.getCampaigns(),
        pageInfo: {
          endCursor: "TODO implement",
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: "TODO implement"
        }
      }
    },
    async campaign() {
      return null
    },
    async isEligible (obj, args, context) {
      if (process.env.NODE_ENV !== 'production') {
        return {
          code: 200,
          success: true,
          eligibility: 'Eligible',
          countryName: 'N/A',
          countryCode: 'N/A'
        }
      }

      const locationInfo = await getLocationInfo(context.userIp)
      if (!locationInfo) {
        return {
          code: 500,
          success: false,
          message: 'Internal server error'
        }
      }
      let eligibility = 'Eligible'
      if (locationInfo.isForbidden)
        eligibility = 'Forbidden'
      else if (locationInfo.isRestricted)
        eligibility = 'Restricted'

      return {
        code: 200,
        success: true,
        eligibility: eligibility,
        countryName: locationInfo.countryName,
        countryCode: locationInfo.countryCode
      }
    }
  },
  Mutation: {
    async invite() {
      return {
        code: '418',
        success: false,
        message: 'I am a teapot'
      }
    },
    async enroll() {
      return {
        code: '418',
        success: false,
        message: 'I am a teapot'
      }
    },
    async log() {
      return {
        code: '418',
        success: false,
        message: 'I am a teapot'
      }
    }
  }
}

module.exports = resolvers
