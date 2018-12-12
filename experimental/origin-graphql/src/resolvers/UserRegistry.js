export default {
  id: contract => contract.options.address,
  users: async contract => {
    const events = await contract.getPastEvents('NewUser', { fromBlock: 0 })
    return events.map(e => ({ id: e.returnValues._identity }))
  }
}
