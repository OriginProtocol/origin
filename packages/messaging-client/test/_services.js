import services from '@origin/services'

export default async function() {
  return await services({
    ganache: { inMemory: true },
    ipfs: true,
    populate: true,
    deployContracts: true,
    relayer: false,
    graphqlServer: false,
    contractsFile: 'tests'
  })
}
