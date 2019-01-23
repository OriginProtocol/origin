const GraphQLJSON = require('graphql-type-json')

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  JSON: GraphQLJSON,
  Query: {}
}

module.exports = resolvers
