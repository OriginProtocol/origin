//const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date')
const db = require('./db')
const { Invite } = require('../resources/invite')


// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  /* TODO:
   * Use this pagination helpers when implementing pagination:
   * https://github.com/OriginProtocol/origin/blob/master/experimental/origin-graphql/src/resolvers/_pagination.js
   */
  //JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
  Query: {
    async campaigns() {
      // query campaigns from DB
      return {
        nodes: await db.getCampaigns()
      }
    },
    async campaign() {
      return null
    },
    async invites(root, args) {
      return Invite.getInvitesStatus(args.walletAddress, args.campaignId)
    },
    async inviteInfo(root, args) {
      return await Invite.getReferrerInfo(args.code)
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
