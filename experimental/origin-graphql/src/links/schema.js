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
import { setContext } from 'apollo-link-context'

const growthServerAddress = context.growth || 'http://localhost:4001'
const growthSchema = makeExecutableSchema({
  typeDefs: growthTypeDefs,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('growth_auth_token')
  const returnObject = {
    headers: {
      ...headers
    }
  }

  if (token) {
    returnObject.headers['authentication'] = `{"growth_auth_token": "${token}"}`
  }

  // return the headers to the context so httpLink can read them
  return returnObject
})

const httpLink = new HttpLink({ uri: `${growthServerAddress}/graphql`, fetch })

const schema = mergeSchemas({
  schemas: [
    makeRemoteExecutableSchema({
      schema: growthSchema,
      link: authLink.concat(httpLink)
    }),
    makeExecutableSchema({ typeDefs, resolvers })
  ]
})

export default schema
