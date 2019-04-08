![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Bridge Server

The Origin Bridge Server connects the old world to the new.

Most traditional web APIs, such as those from Facebook and Twitter, can only interact with a centralized server located at a specific domain. A decentralized application, like our Origin Demo DApp, doesn't need to "live" on a particular server. (In fact, you can load it from any IPFS gateway!) Thus, in order for the DApp to use an "old world" API, it needs a Bridge Server.

Origin hosts a Bridge Server, but in the true spirit of decentralization, anyone is free to clone our open source code and host their own.

You can connect to and use our hosted Bridge Server at [bridge.originprotocol.com](https://bridge.originprotocol.com). The `master` branch of this repo is available at [bridge.dev.originprotocol.com](https://bridge.dev.originprotocol.com).

DApps can connect to the Bridge Server of their choosing in order to enable the following functionality which is either impossible or impractical to do directly onchain, including:


### Identity

We need a centralized server that can handle tasks like issuing identity attestations and decryptying data that is returned from third-party services like Civic. We also need proxies for fetching public data from services like Facebook and Twitter which require authentication keys.

## One-time Setup

### Prerequisites
- Node 10 or higher required
- Postgresql 9.3 or higher required

### Clone the Starter Configuration Variables

```bash
cp dev.env .env
```
Adjust the values in .env now and in the future to suit your local environment. 

For [EnvKey](https://www.envkey.com/) support, set ENVKEY to the key of the
generated local development key.

#### Database
Set up your ```DATABASE_URL``` to point to where you local database is or will be.

#### Identity attestation
This is optional - only define these environment keys if you want to use your
bridge server deployment as an endpoint for the DApp identity attestation functionality.

- [Facebook](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)
  - FACEBOOK_CLIENT_ID
  - FACEBOOK_CLIENT_SECRET
- [Sendgrid](https://sendgrid.com/docs/Classroom/Send/How_Emails_Are_Sent/api_keys.html)
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL
- [Twilio](https://www.twilio.com/docs/usage/your-request-to-twilio)
  - TWILIO_VERIFY_API_KEY (Can be generated from your [Twilio account](https://www.twilio.com/console/verify/applications))
- [Twitter](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens)
  - TWITTER_CONSUMER_KEY
  - TWITTER_CONSUMER_SECRET
- [Google](https://developers.google.com/identity/protocols/OAuth2WebServer)
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET

### Set Up Your Database

```bash
npm run migrate
```

Make sure the DB name you used is indicated in your ```DATABASE_URL``` in the `.env` file.
Example: `DATABASE_URL`=`postgresql://localhost:5432/bridge-server`

## Every Time You Develop

### Run the Server


```bash
npm run start
```

This starts a development server on ```localhost:5000``` by default.

### Run the Tests

Throughout the development process and before committing or deploying, run:

```bash
npm run test
```

### Code Formatting

We use [prettier](https://github.com/prettier/prettier) to enforce code formatting. You can automatically format code by running:

```
npm run prettier
```

## Contributing

Please send your pull requests to the `master` branch.

## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

To get involved, please join our [Discord channel](https://discord.gg/jyxpUSe) and review our [guide to contributing](https://docs.originprotocol.com/#contributing).
