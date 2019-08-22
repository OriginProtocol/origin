import './env'
import server from './src/server'

server
  .listen({
    port: (() => {
      const v = parseInt(process.env.GRAPHQL_SERVER_PORT)
      if (v && Number.isInteger(v)) {
        return v
      } else if (v && Number.isNaN(v)) {
        console.warn('GRAPHQL_SERVER_PORT is NaN.  Using default')
      }
      return 4007
    })()
  })
  .then(({ url }) => {
    console.log(`🚀  GraphQL server ready at ${url}`)
  })
