import { HttpLink } from 'apollo-link-http'
import {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas
} from 'graphql-tools'

import fetch from 'node-fetch'
import typeDefs from '../typeDefs/index'
import resolvers from '../resolvers/index'
import growthTypeDefs from '../typeDefs/Growth'
import context from '../contracts'

const growthServerAddress = context.growth || 'http://localhost:4001'
const growthSchema = makeExecutableSchema({
  typeDefs: growthTypeDefs,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})

const schema = mergeSchemas({
  schemas: [
    makeRemoteExecutableSchema({
      schema: growthSchema,
      link: new HttpLink({ uri: `${growthServerAddress}/graphql`, fetch })
    }),
    makeExecutableSchema({ typeDefs, resolvers })
  ]
})

export default schema
