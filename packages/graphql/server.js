import server from './src/server'

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
