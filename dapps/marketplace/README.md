# ![Origin Protocol](data/origin-header.png)

A UI leveraging `@origin/graphql`. View and manage listings and offers.

Test builds available [here](https://originprotocol.github.io/test-builds/).

## Usage

Refer to
[DEVELOPMENT.md](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md)

## Tests

Tests are run in a headless Chrome instance via puppeteer

    npm test

To observe the tests running in the browser:

    npm run test:browser

For more information please see the README in the `test` sub-directory.

## Setting up Telegram Attestation on local
1. Go to [`@BotFather` on Telegram](https://web.telegram.org/#/im?p=@BotFather)
2. Send the following command to create a new bot
    ```
    /newbot
    ```
    Give a name and username when prompted. Note down the Bot Token once the bot is created.
3. Enter the command `/mybots` to list all your bots and select the bot you created in the previous step.
4. Whitelist your IP by choosing `Bot Settings` > `Domain` > `Edit Domain` and then enter your IP address with `http://` prefix
    ```
    http://<YOUR IP ADDRESS>
    ```
5. Add the following env variables to DApp's ENVKEY or export it on the terminal
    ```
    TELEGRAM_BOT_USERNAME=<YOUR BOT USERNAME>
    ```
5. Add the following env variables to bridge server's ENVKEY or export it on the terminal
    ```
    TELEGRAM_BOT_TOKEN=<YOUR BOT TOKEN HERE>
    ```
6. Start the DApp with the following command
    ```
    HOST=<YOUR IP ADDRESS> PORT=80 yarn start
    ```

### Additional step for Telegram Webhooks
When you want to run the Telegram Webhooks for group join event verification, you should do the following. 
1. Create a web tunnel for bridge server. [Refer `@origin/bridge`'s README.md](https://github.com/OriginProtocol/origin/blob/master/infra/bridge/README.md#setup-tunnel-for-webhooks-optional)
2. Add the bot you created to the group as an admin. 
    
    Note: You can add the bot to as many groups as you want. Events from all the groups will be posted to the webhook endpoint
3. Hit the following URL on your browser
    ```
    http://localhost:5000/hooks/telegram/__init
    ```
