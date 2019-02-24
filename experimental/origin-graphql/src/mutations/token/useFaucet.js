const faucetUrl = 'https://faucet.staging.originprotocol.com/tokens'

async function useFaucet(_, { networkId = 4, wallet }) {
  const url = `${faucetUrl}?wallet=${wallet}&network_id=${networkId}`
  try {
    const response = await fetch(url)
    return response.ok ? true : false
  } catch (e) {
    return false
  }
}

export default useFaucet
