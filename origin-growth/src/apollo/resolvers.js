//const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date')

const { GrowthCampaign } = require('../resources/campaign')
const {
  authenticateEnrollment,
  getUserAuthenticationStatus
} = require('../resources/authentication')
const { getLocationInfo } = require('../util/locationInfo')
const { campaignToApolloObject } = require('./adapter')
const { GrowthInvite } = require('../resources/invite')
const { sendInvites } = require('../resources/email')
const enums = require('../enums')
const logger = require('../logger')

const requireEnrolledUser = context => {
  if (
    context.authentication !==
    enums.GrowthParticipantAuthenticationStatus.Enrolled
  ) {
    throw new Error('User not authenticated!')
  }
}

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  /* TODO:
   * Use this pagination helpers when implementing pagination:
   * https://github.com/OriginProtocol/origin/blob/master/origin-graphql/src/resolvers/_pagination.js
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
    async campaigns(_, args, context) {
      const campaigns = await GrowthCampaign.getAll()

      return {
        totalCount: campaigns.length,
        nodes: campaigns.map(
          async campaign =>
            await campaignToApolloObject(
              campaign,
              context.authentication,
              context.walletAddress
            )
        ),
        pageInfo: {
          endCursor: 'TODO implement',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'TODO implement'
        }
      }
    },
    async campaign(root, args, context) {
      const campaign = await GrowthCampaign.get(args.id)
      return await campaignToApolloObject(
        campaign,
        context.authentication,
        context.walletAddress
      )
    },
    async inviteInfo(root, args) {
      return await GrowthInvite.getReferrerInfo(args.code)
    },
    async inviteCode(root, args, context) {
      requireEnrolledUser(context)
      return GrowthInvite.getInviteCode(context.walletAddress)
    },
    async isEligible(obj, args, context) {
      let eligibility
      if (process.env.NODE_ENV !== 'production') {
        // In non production environment, always return eligible.
        eligibility = {
          eligibility: 'Eligible',
          countryName: 'N/A',
          countryCode: 'N/A'
        }
      } else {
        // Geolocalize based on IP and check eligibility.
        eligibility = getLocationInfo(context.headers['x-real-ip'])
      }
      logger.debug('Eligibility:', JSON.stringify(eligibility))
      return eligibility
    },
    async enrollmentStatus(_, args, context) {
      return await getUserAuthenticationStatus(
        context.authToken,
        args.walletAddress
      )
    }
  },
  Mutation: {
    // Sends email invites with referral code on behalf of the referrer.
    async invite(_, args, context) {
      requireEnrolledUser(context)

      logger.info('invite mutation called.')
      // FIXME: implement rate limiting to avoid spam attack.
      await sendInvites(context.walletAddress, args.emails)
      return true
    },
    async enroll(_, args) {
      //TODO: check country eligibility here also
      // const locationInfo = getLocationInfo(context.countryCode)
      // if (locationInfo.isForbidden) {
      //   return {
      //     error: `Users from ${locationInfo.countryName} are not eligible for growth campaign`
      //   }
      // }

      try {
        const authToken = await authenticateEnrollment(
          args.accountId,
          args.agreementMessage,
          args.signature
        )

        /* Make referral connection after we are sure user provided the correct accountId
         *
         * Important to keep in mind: We realise making a referral connection inside enroll mutation
         * has a downside where a referrer gets the reward only when the referee also enrolls into
         * the growth campaign.
         *
         * We have decided to take this approach in favour of making the referral connection as soon
         * as the user satisfy both conditions:
         * - enters Welcome page with invite code
         * - has a wallet installed
         * as the above approach happens before a user is authenticated and this leaves us exposed
         * to situations where bad actors could make false referral connections to their own campaigns.
         */
        if (args.inviteCode !== undefined) {
          await GrowthInvite.makeReferralConnection(
            args.inviteCode,
            args.accountId
          )
        }

        return { authToken }
      } catch (e) {
        logger.warn('Authenticating user failed: ', e.message, e.stack)
        return {
          error: 'Can not authenticate user'
        }
      }
    },
    async inviteRemind(_, args, context) {
      requireEnrolledUser(context)
      logger.info(
        `invite remind mutation called with invitationId: ${args.invitationId}.`
      )
      // TODO: implement
      return true
    },
    log() {
      // TODO: implement
      logger.info('log mutation called.')
      return true
    }
  }
}

module.exports = resolvers
