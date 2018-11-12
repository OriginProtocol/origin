import { makeExecutableSchema } from 'graphql-tools'

import typeDefs from '../typeDefs/index'
import resolvers from '../resolvers/index'

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
