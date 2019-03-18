import { SchemaLink } from 'apollo-link-schema'
import schema from './schema'

export default new SchemaLink({ schema, context: () => ({}) })
