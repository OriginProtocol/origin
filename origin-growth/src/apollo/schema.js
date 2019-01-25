const { gql } = require('apollo-server-express')
const schema = require('../../../experimental/origin-graphql/src/typeDefs/Growth')
const typeDefs = gql`${schema}`

module.exports = typeDefs
