//const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date')

const { GrowthCampaign } = require('../resources/campaign')
const { getLocationInfo } = require('../util/locationInfo')
const { campaignToApolloObject } = require('./adapter')
const { GrowthInvite } = require('../resources/invite')
const { sendInviteEmails } = require('../resources/email')

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
      if (obj.type === 'Referral') {
        return 'ReferralAction'
      } else {
        return 'GrowthAction'
      }
    }
  },
  Query: {
    async campaigns(_, args) {
      const campaigns = await GrowthCampaign.getAll()
      return {
        totalCount: campaigns.length,
        nodes: campaigns.map(
          async campaign =>
            await campaignToApolloObject(campaign, args.walletAddress)
        ),
        pageInfo: {
          endCursor: 'TODO implement',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'TODO implement'
        }
      }
    },
    async campaign(root, args) {
      const campaign = await GrowthCampaign.get(args.id)
      return await campaignToApolloObject(campaign, args.walletAddress)
    },
    async inviteInfo(root, args) {
      return await GrowthInvite.getReferrerInfo(args.code)
    },
    async isEligible(obj, args, context) {
      if (process.env.NODE_ENV !== 'production') {
        return {
          eligibility: 'Eligible',
          countryName: 'N/A',
          countryCode: 'N/A'
        }
      }

      const locationInfo = getLocationInfo(context.countryCode)
      if (!locationInfo) {
        return {
          eligibility: 'Unknown',
          countryName: 'N/A',
          countryCode: 'N/A'
        }
      }
      let eligibility = 'Eligible'
      if (locationInfo.isForbidden) eligibility = 'Forbidden'
      else if (locationInfo.isRestricted) eligibility = 'Restricted'

      return {
        eligibility: eligibility,
        countryName: locationInfo.countryName,
        countryCode: locationInfo.countryCode
      }
    }
  },
  Mutation: {
    async invite(root, args) {
      // FIXME: Check the referrer against Auth token.
      await sendInviteEmails(args.walletAddress, args.emails)
      return {
        code: '200',
        success: true,
        message: 'Invite successfully sent'
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
