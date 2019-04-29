import { HttpLink } from 'apollo-link-http'
import {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
  addMockFunctionsToSchema
} from 'graphql-tools'

import fetch from 'cross-fetch'
import typeDefs from '../typeDefs/index'
import resolvers from '../resolvers/index'
import growthTypeDefs from '../typeDefs/Growth'
import context from '../contracts'
import { setContext } from 'apollo-link-context'

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

const httpLink = new HttpLink({ uri: `${context.growth}/graphql`, fetch })

const schemas = [makeExecutableSchema({ typeDefs, resolvers })]

if (context.growth) {
  schemas.unshift(
    makeRemoteExecutableSchema({
      schema: growthSchema,
      link: authLink.concat(httpLink)
    })
  )
} else {
  addMockFunctionsToSchema({
    schema: growthSchema,
    mocks: { DateTime: () => '' }
  })
  schemas.unshift(growthSchema)
}

const schema = mergeSchemas({ schemas })

export default schema
