![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

## Getting Started

### The Easy Way

We recommend [using docker-compose](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md#using-docker-compose) to simplify the process of configuring and running all of the Origin packages.

## The Basics

### The Registry

An user must register himself in the registry to be able to message others. 
For this, the user has to generate a public/private key pair and sign two messages.

1. A sign, with the generated private key, of the any phrase. Typically the DApp asks the users to sign the following message.

  ```I am ready to start messaging on Origin.```

2. A sign of a message that includes the generated wallet's address. This is to be signed with user's own wallet. DApp enforces message in the following format.

  ```My public messaging key is: 0xabcdef```

The keys from the registry is used to verify sign on any new messages from the user. 

### Conversation

A conversation between two users. The users will have generate encryption keys to be used for every conversation. Each message in a conversation can be one of the following three type

1. `keys` - Encryption keys for the conversation.
2. `msg` - Encrypted message.
3. `event` - Any marketplace event that is relevant to the two users in the conversations. Typically offer events from the other conversee.
