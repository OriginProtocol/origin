const { gql } = require('apollo-server-express')
const schema = require('@origin/graphql/src/typeDefs/Growth')
const typeDefs = gql`
  ${schema}
`

module.exports = typeDefs
