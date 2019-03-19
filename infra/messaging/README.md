![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Messaging

Read about Origin Messaging [on Medium](https://medium.com/originprotocol/introducing-origin-messaging-decentralized-secure-and-auditable-13c16fe0f13e).

## Getting Started

### The Easy Way

We recommend [running Origin Box](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md#using-docker-compose) to simplify the process of configuring and running all of the modules within the Origin Monorepo.

### The Not-As-Easy Way

If you're interested in running just the messaging service without notifications, attestations, etc, here are some suggestions for making that happen:

In origin-messaging...

  - Add a websocket address and a namespace of your choosing to origin-messaging/.env
  ```
  MESSAGING_IPFS_WS_ADDRESS=/ip4/0.0.0.0/tcp/9012/ws
  MESSAGING_NAMESPACE=whateveryouwant
  ```
  - Run `npm run start`
  - Watch the output for "Swarm listening on /ip4/127.0.0.1/tcp/9012/ws/ipfs/...{something here}..."
  - Copy the address starting with `/ip4...`

In origin-dapp...

  - Add the ipfs address and matching namespace value to origin-dapp/.env
  
  ```
  IPFS_SWARM=/the/address/that/you/copied/from/the/terminal
  MESSAGING_NAMESPACE=whateveryouwant
  ```
  - Run `npm start`
