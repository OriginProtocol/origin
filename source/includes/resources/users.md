# User

A **User** is an object used to represent a particular user in Origin Protocol.
Users are implemented as [ERC725 identities](https://medium.com/originprotocol/managing-identity-with-a-ui-for-erc-725-5c7422b38c09). Identities in Origin will be portable across platforms that support ERC725.

A user object consists of 2 properties:

- `profile`: Profile information a user chooses to reveal publicly
- `attestations`: A list of 3rd party attestations that the user has added to their identity (see [Attestation documentation](#attestation) for details)
- `identityAddress`: Ethereum address for the identity contract

## set

> To create/update a user

```javascript
// Get a phone attestation object
await origin.attestations.phoneGenerateCode({
  phone: "555-555-5555"
})
let phoneAttestation = await origin.attestations.phoneVerify({
  phone: "555-555-5555",
  code: "123456"
})

// Get a Facebook attestation object
let url = await origin.attestations.facebookAuthUrl()

// Open facebook authentication popup and retrieve authentication code
window.open(url, '', 'width=650,height=500')
let code = await new Promise((resolve, reject) => {
  window.addEventListener('message', (e) => {
    if (String(e.data).match(/^origin-code:/)) {
      resolve(e.data.split(':')[1])
    }
  }, false)
})

// Send code to obtain attestation
let facebookAttestation = await origin.attestations.facebookVerify({
  code: code
})

let myNewUser = {
  profile: { firstName: "Wonder", lastName: "Woman" },
  attestations: [ phoneAttestation, facebookAttestation ]
}
await origin.users.set(myNewUser)
let createdUser = await users.get()

// User has been created!

// Get an email attestation object
await origin.attestations.emailGenerateCode({
  email: "me@my.domain"
})
let emailAttestation = await origin.attestations.emailVerify({
  email: "me@my.domain",
  code: "123456"
})

createdUser.attestations.push(emailAttestation)
await origin.users.set(createdUser)
let updatedUser = await users.get()

// User has been updated!
// final `updatedUser`:
{
  {
    profile: { firstName: "Wonder", lastName: "Woman" },
    attestations: [
      {
        signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
        data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
        claimType: 10,
        service: "phone"
      },
      {
        signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
        data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
        claimType: 3,
        service: "facebook"
      },
      {
        signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
        data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
        claimType: 4,
        service: "twitter"
      }
    ],
    identityAddress: "0x4E72770760c011647D4873f60A3CF6cDeA896CD8"
  }
}
```

If the user does not already exist, it will be created. If it exists, it will be updated.

**Note**: this method should be used as if it will completely override the existing data.
Updates should be made by taking the existing user object, making modifications to it, and then passing the entire updated object into the `set` method.

## get

> To retrieve a user

```javascript
let myUser = await origin.users.get()
let anotherUser = await origin.users.get(otherUserAddress)
// Returns (user object)
{
  profile: {}
  attestations: [],
  identityAddress: ''
}
```

With no parameters passed in, this will return the current user.
If a wallet address is passed in, this will return the user associated with that wallet.
