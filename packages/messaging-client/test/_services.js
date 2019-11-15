import services from '@origin/services'

export default async function() {
  return await services({
    ganache: { inMemory: true },
    ipfs: false,
    populate: false,
    deployContracts: false,
    relayer: false,
    graphqlServer: false,
    contractsFile: 'tests'
  })
}
