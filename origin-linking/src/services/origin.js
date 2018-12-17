import Origin from 'origin'
import Web3 from 'web3'

const mobilize = (str) => {
  if (process.env.MOBILE_LOCALHOST_IP)
  {
    return str
      .replace('localhost', process.env.MOBILE_LOCALHOST_IP)
      .replace(/127\.0\.0\.1(?=[^0-9]|$)/, process.env.MOBILE_LOCALHOST_IP)
  }
  else
  {
    return str
  }
}


const providerUrl = process.env.PROVIDER_URL
const mobileLocalhostIp = process.env.MOBILE_LOCALHOST_IP
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl, 20000))
const origin = new Origin({
  ipfsDomain: process.env.IPFS_DOMAIN,
  ipfsApiPort: process.env.IPFS_API_PORT,
  ipfsGatewayPort: process.env.IPFS_GATEWAY_PORT,
  ipfsGatewayProtocol: process.env.IPFS_GATEWAY_PROTOCOL,
  web3})

export default origin
export {providerUrl, mobilize}
