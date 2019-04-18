![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Notifications Server

This service is capable of contacting users on various channels. Right now it supports email, browser push, and mobile push.

Messages are normally triggered by a POST to the `/events` endpoint on this server. See the `test` directory for examples manually triggering messages for testing.

Options

 - `--override-email` or env var `OVERRIDE_EMAIL` : Email which will recieve **all** emails. This can be useful for testing on live data where you want to see what emails users would receive.
 - `--fromEmail` or env var `SENDGRID_FROM_EMAIL` : Email from which messages are sent
 - `--asmGroupId` or env var `ASM_GROUP_ID` : SendGrid ASM group for handling unsubscribes.
 - `--email-file-out` or env var `EMAIL_FILE_OUT` : Write emails also to files, using this directory+prefix. e.g. "emails/finalized"


## Browser Notifcations (Old)

See https://github.com/OriginProtocol/origin/issues/806 👊

## Getting Started

### The Easy Way

We recommend [running Origin Box](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md#using-docker-compose) to simplify the process of configuring and running all of the modules within the Origin Monorepo.

### The Not-As-Easy Way

If you're interested in running just the notifications service (and the event listener) without messaging, attestations, etc, here are some suggestions for making that happen:


In origin-notifications...

  - Install and run [PostgreSQL](https://www.postgresql.org/)
  - Run `npm install web-push -g`
  - Run `web-push generate-vapid-keys`
  - Add database url, email address, public and private keys to origin-notifications/.env
  ```
  DATABASE_URL=postgresql://localhost/notification
  VAPID_EMAIL_ADDRESS=XXXXXXXXXX-your-email-address-XXXXXXXXXX
  VAPID_PRIVATE_KEY=XXXXXXXXXX-your-private-key-XXXXXXXXXX
  VAPID_PUBLIC_KEY=XXXXXXXXXX-your-public-key-XXXXXXXXXX
  ```
  - Run `createdb notification`
  - Run `npm install -g sequelize-cli`
  - Run `sequelize db:migrate`
  - Run `npm run start:development`

NOTE: VAPID key is for web-push. More detail [here](https://stackoverflow.com/questions/40392257/what-is-vapid-and-why-is-it-useful).

In origin-dapp...

  - Add public key and notifications url to origin-dapp/.env
  ```
  NOTIFICATIONS_KEY=XXXXXXXXXX-your-public-key-XXXXXXXXXX
  NOTIFICATIONS_URL=http://localhost:3456/
  ```
  - Run `npm start`

In origin-discovery...
  - Add variables to origin-discovery/.env
  ```
  AFFILIATE_ACCOUNT=0x821aea9a577a9b44299b9c15c88cf3087f3b5544
  ARBITRATOR_ACCOUNT=0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
  BLOCK_EPOCH=0
  DATABASE_URL=postgresql://localhost/discovery
  NETWORK_ID=999
  IPFS_URL=http://localhost:8080/
  WEB3_URL=http://localhost:8545/
  ```
  - Run `node src/listener/listener.js --continue-file=continue --webhook=http://localhost:3456/events`

  (From time to time, you may need to `rm continue` in origin-discovery.)

To test in the DApp...

1. Create a listing
1. Enable notifications
1. Make an offer from a different account

For more (outdated) information, see [the original pull request](https://github.com/OriginProtocol/origin/pull/795#issue-224602842).


### Eventlistener

For local testing, these options are usual for testing against `rinkeby` network.

    npm run start:listener:development -- --identity --growth --marketplace --network=rinkeby --continue-file=../continue --webhook=http://localhost:3456/events --verbose --concurrency=4

