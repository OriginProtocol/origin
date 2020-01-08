import './env'
import server from './src/server'

const PORT = (() => {
  const v = parseInt(process.env.GRAPHQL_SERVER_PORT)
  if (v && Number.isInteger(v)) {
    return v
  } else if (v && Number.isNaN(v)) {
    console.warn('GRAPHQL_SERVER_PORT is NaN.  Using default')
  }
  return 4007
})()

server.listen(
  {
    port: PORT
  },
  () => {
    console.log(`🚀  GraphQL server ready at http://127.0.0.1:${PORT}/graphql`)
  }
)
