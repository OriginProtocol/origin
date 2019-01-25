//const GraphQLJSON = require('graphql-type-json')

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  /* TODO:
   * Use this pagination helpers when implementing pagination:
   * https://github.com/OriginProtocol/origin/blob/master/experimental/origin-graphql/src/resolvers/_pagination.js
   */
  //JSON: GraphQLJSON,
  Query: {
    async campaigns () {
      // query campaigns from DB
      return {
        nodes: [],
      }
    },
    async campaign () {
      return null
    }
  },
  Mutation: {
    async invite () {
      return {
        code: "418",
        success: false,
        message: "I am a teapot"
      }
    },
    async enroll () {
      return {
        code: "418",
        success: false,
        message: "I am a teapot"
      }
    },
    async log () {
      return {
        code: "418",
        success: false,
        message: "I am a teapot"
      }
    }
  }
}

module.exports = resolvers
