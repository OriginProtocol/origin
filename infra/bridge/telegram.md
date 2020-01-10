## Bot
 - Telegram doesn't have traditional REST API where we generate a client and use that to interact with the API. We instead have bots that can act as an actual telegram account and can be controlled via code.
 - We use a single bot for both attestation and rewarding user.
 - The Bot is, at present, a passive one: It doesn't try to start a conversation with anyone or sends messages to anyone or any group. However, it replies to every message sent to it via DM.
 - For most part, the bot only reads the messages sent in private and in groups it is added to.
 - All the updates that we receive through webhooks or polling is from the bots.

Bridge can receive telegram updates in two ways:
  - Using webhooks: Bridge exposes an endpoint that is registered with Telegram as a webhook. When an event happens, telegram posts the update to the webhook
  - Without webhook: Bridge polls the Telegram API every few seconds for new updates

An update isn't always a message. It can also be events like a user joining a group or leaving a group.

To listen to a group's events and messages, you have to add the bot to the group.

## How updates are processed:
Bridge, by behaviour, only looks for messages directly sent to the bot and `new_chat_members` event on groups `originprotocolkorea` and `originprotocol`
  - When a direct message is received, 
    - If it is a `/start` command with valid address param, it creates a telegram attestation entry.
    - Otherwise, the chat message is logged to the DB and emailed to support@originprotocol.com
  - When `new_chat_members` event exists, it creates the `FollowedOnTelegram` growth event

## Replying to updates:
  - When running in webhook mode, the reply message has to be written to the response stream before ending it.
  - When polling, a separate XHR request has to be made. This has rate-limit of 30 messages per second (overall and across all users)

## Operational playbook
### To setup the webhook:
  1. Remove the key `TELEGRAM_DISABLE_WEBHOOKS` or set it's to `false`
  2. Restart the bridge server
  3. Go to following URL in the browser: `/hooks/telegram/__init`

### To setup polling:
  1. Set `TELEGRAM_DISABLE_WEBHOOKS` to `true`
  2. Restart the bridge server

### Checking status of webhook
Send a POST request (using postman or any HTTP client/library) to `/hooks/telegram/__getWebhookInfo`
  
The value of authorization header should be same as env variable `WEBHOOK_ADMIN_SECRET`

### Deleting webhook
Send a POST request to `/hooks/telegram/__deleteWebhook` with authorization header. This deletes the webhook but doesn't start polling

### Clear the queue
Send a POST request to `/hooks/telegram/__clearQueue` with authorization header. This recursively marks the first 10k messages on the queue as read

### A few notes:
  - It is not possible to get updates through polling/HTTP requests, when a webhook is active. So, you have to delete the webhook. If you start polling on bridge, it tries and deletes webhook before starting
  - To check the logs, you have to check the logs of the bridge.
