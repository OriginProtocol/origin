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

import { getPrimaryAccount } from '../utils/primaryAccount'

const growthSchema = makeExecutableSchema({
  typeDefs: growthTypeDefs,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})

const authLink = setContext(async (_, { headers }) => {
  const token = localStorage.getItem('growth_auth_token')
  const growthSecret = localStorage.getItem('growth_admin_secret')
  const growthWallet = localStorage.getItem('growth_wallet_override')
  const returnObject = {
    headers: {
      ...headers
    }
  }

  const primaryAccount = await getPrimaryAccount()

  if (primaryAccount) {
    const authToken = context.authClient.getAccessToken(primaryAccount.id)
    if (authToken) {
      returnObject.headers['authorization'] = `Bearer ${authToken}`
    }
  }

  if (token) {
    returnObject.headers['authentication'] = `{"growth_auth_token": "${token}"}`
  }

  if (growthSecret && growthWallet) {
    returnObject.headers['x-growth-secret'] = growthSecret
    returnObject.headers['x-growth-wallet'] = growthWallet
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
    mocks: {
      DateTime: () => '',
      Query: () => ({
        enrollmentStatus: () => 'NotEnrolled'
      })
    }
  })
  schemas.unshift(growthSchema)
}

const schema = mergeSchemas({ schemas })

export default schema
