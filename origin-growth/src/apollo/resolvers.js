//const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date')
const { Campaign } = require('../rules/rules')
const { Fetcher } = require('../rules/rules')
const { getLocationInfo } = require('../util/locationInfo')

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  /* TODO:
   * Use this pagination helpers when implementing pagination:
   * https://github.com/OriginProtocol/origin/blob/master/experimental/origin-graphql/src/resolvers/_pagination.js
   */
  //JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
  GrowthBaseAction: {
    __resolveType(obj) {
      if (obj.type === 'referral'){
        return 'ReferralAction'
      } else {
        return 'GrowthAction'
      }
    },
  },
  Query: {
    async campaigns(_, args) {

      const campaigns = await Fetcher.getAllCampaigns()
      return {
        totalCount: campaigns.length,
        nodes: campaigns.map(async (campaign) => await campaign.toApolloObject(args.walletAddress)),
        pageInfo: {
          endCursor: 'TODO implement',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'TODO implement'
        }
      }
    },
    async campaign() {
      return null
    },
    async isEligible(obj, args, context) {
      if (process.env.NODE_ENV !== 'production') {
        return {
          code: 200,
          success: true,
          eligibility: 'eligible',
          countryName: 'N/A',
          countryCode: 'N/A'
        }
      }

      const locationInfo = getLocationInfo(context.countryCode)
      if (!locationInfo) {
        return {
          code: 500,
          success: false,
          message: 'Internal server error'
        }
      }
      let eligibility = 'eligible'
      if (locationInfo.isForbidden) eligibility = 'forbidden'
      else if (locationInfo.isRestricted) eligibility = 'restricted'

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
