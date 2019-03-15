# Origin IPFS

Convenience methods for getting and setting data in IPFS

## Usage

```
import { get, post } from '@origin/ipfs'

const ipfsHash = await post("https://ipfs.originprotocol.com", { my: "data" })
console.log(ipfsHash)

const retrieved = await get("https://ipfs.originprotocol.com", ipfsHash)
console.log(retrieved)

```
