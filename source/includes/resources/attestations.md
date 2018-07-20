# Attestation

An **Attestation** is a confirmation that some piece of identity information has been verified by a trusted 3rd party.

Origin provides an attestation service that users can optionally use to add attestations to their profile.

The following attestations are currently offered:

 - Email
 - Phone
 - Facebook
 - Twitter
 - Airbnb

Currently, an attestation is simply a public *confirmation* that something has been verified by Origin.
The information itself is not made public.

For example, when a user adds an email attestation to their profile, all that anyone else will be able to see is that their email has been verified by Origin.
The email address itself remains private.

Note that these methods are used to simply generate attestation objects.
Once an attestation object has been created, it needs to be added to a user object for it to take effect.

## phoneGenerateCode

> To send an SMS verification code

```javascript
await origin.attestations.phoneGenerateCode({
  country_calling_code: "1",
  phone: "555-555-5555",
  method: "sms",
  locale: "en"
})
```

This will perform a phone verification by calling or sending a SMS to a phone number.

The phone number that will receive the call or SMS is the `country_calling_code` combined with the `phone`. The `phone` should therefore be provided in the national format.

The `method` can either by "call" or "sms".

The `locale` parameter is optional and it defines the language of the call or the SMS. If not provided a sensible default is used based on the country of the phone number. Supported languages are af, ar, ca, zh, zh-CN, zh-HK, hr, cs, da, nl, en, fi, fr, de, el, he, hi, hu, id, it, ja, ko, ms, nb, pl, pt-BR, pt, ro, ru, es, sv, tl, th, tr, vi.

## phoneVerify

> To verify a ownership of a phone number

```javascript
let phoneAttestation = await origin.attestations.phoneVerify({
  wallet: myWalletAddress,
  country_calling_code: "1",
  phone: "555-555-5555",
  code: "123456"
})
// Returns (attestation object)
{
  signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
  data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
  claimType: 10,
  service: "phone"
}
```

This will verify that the `code` submitted in the request is the one that was sent to the phone number in the `phoneGenerateCode` call. If it is valid, an attestation object will be returned.

Note that the `country_calling_code` and `phone` must have the same values as the values used in the `phoneGenerateCode` call.

## emailGenerateCode

> To send an email verification code

```javascript
await origin.attestations.emailGenerateCode({
  email: "me@my.domain"
})
```

This will send an email to the given email address containing a verification code.

## emailVerify

> To verify ownership of an email address

```javascript
let emailAttestation = await origin.attestations.emailVerify({
  wallet: myWalletAddress,
  email: "me@my.domain",
  code: "123456"
})
// Returns (attestation object)
{
  signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
  data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
  claimType: 11,
  service: "email"
}
```

This will verify that the `code` submitted in the request is the one that was sent to the email address in the `emailGenerateCode` call. If it is valid, an attestation object will be returned.

## facebookAuthUrl

> To get Facebook authentication url

```javascript
let url = await origin.attestations.facebookAuthUrl()

window.open(url, '', 'width=650,height=500')
let code = await new Promise((resolve, reject) => {
  window.addEventListener('message', (e) => {
    if (String(e.data).match(/^origin-code:/)) {
      resolve(e.data.split(':')[1])
    }
  }, false)
})
console.log('code', code) // use this value in `facebookVerify`
```

This will return a url which your dapp should open in a popup window.
The page will ask the user to grant permissions to the Origin app, which will be used to verify their Facebook identity.
Once permissions have been granted, the popup window will [post a message](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) back to the dapp. You should listen for this message, which will contain the `code` needed for the `facebookVerify` call.

## facebookVerify

> To verify ownership of a Facebook account

```javascript
let facebookAttestation = await origin.attestations.facebookVerify({
  code: "12345" // code obtained from `facebookAuthUrl`
})
// Returns (attestation object)
{
  signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
  data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
  claimType: 3,
  service: "facebook"
}
```

This will perform Facebook oauth verification on the specified `code`. If it is valid, an attestation object will be returned.

Note that `code` is the oauth code generated in `facebookAuthUrl`.

## twitterAuthUrl

> To get Twitter authentication url

```javascript
let url = await origin.attestations.twitterAuthUrl()

window.open(url, '', 'width=650,height=500')
let code = await new Promise((resolve, reject) => {
  window.addEventListener('message', (e) => {
    if (String(e.data).match(/^origin-code:/)) {
      resolve(e.data.split(':')[1])
    }
  }, false)
})
console.log('code', code) // use this value in `twitterVerify`
```

This will return a url which your dapp should open in a popup window.
The page will ask the user to grant permissions to the Origin app, which will be used to verify their Twitter identity.
Once permissions have been granted, the popup window will [post a message](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) back to the dapp. You should listen for this message, which will contain the `code` needed for the `twitterVerify` call.

## twitterVerify

> To verify ownership of a Twitter account

```javascript
let twitterAttestation = await origin.attestations.twitterVerify({
  code: "12345" // code obtained from `twitterAuthUrl`
})
// Returns (attestation object)
{
  signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
  data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
  claimType: 4,
  service: "twitter"
}
```

This will perform Twitter oauth verification on the specified `code`. If it is valid, an attestation object will be returned.

Note that `code` is the code generated in `twitterAuthUrl`

## airbnbGenerateCode

> To generate verification code

```javascript
await origin.attestations.airbnbGenerateCode({
  wallet: myWalletAddress,
  airbnbUserId: // user's id on Airbnb website
})
// Returns (object)
{
  code: "0x0deef6ef"
}
```

This will generate a unique code that should be inserted into user's Airbnb profile description.

## airbnbVerify

> To verify ownership of Airbnb profile

```javascript
let emailAttestation = await origin.attestations.airbnbVerify({
  wallet: myWalletAddress,
  airbnbUserId: // user's id on Airbnb website
})
// Returns (attestation object)
{
  signature: "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
  data: "0x7f5e752d19fee44e13bb0cc820255017c35584caddc055641d6ccadfa3afca01",
  claimType: 5,
  service: "airbnb"
}
```

If user has inserted the correct `code` in his Airbnb profile, an attestation object will be returned.
