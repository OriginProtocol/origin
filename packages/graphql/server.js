import server from './src/server'

server
  .listen({
    port: (() => {
      const v = parseInt(process.env.GRAPHQL_SERVER_PORT)
      if (v && Number.isInteger(v)) {
        return v
      }
      return 4000
    })()
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
