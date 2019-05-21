import { SchemaLink } from 'apollo-link-schema'
import schema from './remoteSchema'

export default new SchemaLink({ schema })
