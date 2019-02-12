import express from 'express'
import expressWs from 'express-ws'
import Linker from './logic/linker'
import Hot from './logic/hot'

const router = express.Router()
//doing this is a hack for detached routers...
expressWs(router)

const CLIENT_TOKEN_COOKIE = "ct"
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN

const getClientToken = req => {
  return req.cookies[CLIENT_TOKEN_COOKIE]
}

const clientTokenHandler = (res, clientToken) => {
  if (clientToken) {
    res.cookie(CLIENT_TOKEN_COOKIE, clientToken, {expires:new Date(Date.now() + 15 * 24 * 3600 * 1000), httpOnly:true})
  }
}

const linker = new Linker()
const hot = new Hot()

router.post("/generate-code", async (req, res) => {
  const _clientToken = getClientToken(req)
  const {return_url, session_token, pub_key, pending_call, notify_wallet} = req.body
  const {clientToken, sessionToken, code, linked} = await linker.generateCode(_clientToken, session_token, pub_key, req.useragent, return_url, pending_call, notify_wallet)
  clientTokenHandler(res, clientToken)
  res.send({session_token:sessionToken, link_code:code, linked})
})

router.get("/link-info/:code", async (req, res) => {
  const {code} = req.params
  // this is the context
  const {appInfo, linkId, pubKey} = await linker.getLinkInfo(code)
  res.send({app_info:appInfo, link_id:linkId, pub_key:pubKey})
})

router.get("/server-info", (req, res) => {
  // this is the context
  const {
    providerUrl,
    contractAddresses,
    ipfsGateway,
    ipfsApi,
    dappUrl,
    messagingUrl,
    profileUrl,
    sellingUrl,
    attestationAccount,
    perfModeEnabled,
    discoveryServerUrl
  } = linker.getServerInfo()
  res.send({
    provider_url:providerUrl,
    contract_addresses:contractAddresses,
    ipfs_gateway:ipfsGateway,
    ipfs_api:ipfsApi,
    dapp_url:dappUrl,
    messaging_url:messagingUrl,
    profile_url:profileUrl,
    selling_url:sellingUrl,
    attestation_account:attestationAccount,
    perf_mode_enabled:perfModeEnabled,
    discovery_server_url:discoveryServerUrl
  })
})


router.post("/call-wallet/:sessionToken", async (req, res) => {
  const clientToken = getClientToken(req)
  const {sessionToken} = req.params
  const {account, call_id, call, return_url} = req.body
  const success = await linker.callWallet(clientToken, sessionToken, account, call_id, call, return_url)
  res.send({success})
})

router.post("/wallet-called/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const {call_id, link_id, session_token, result} = req.body
  const success = await linker.walletCalled(walletToken, call_id, link_id, session_token, result)
  res.send({success})
})

router.post("/link-wallet/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const {code, current_rpc, current_accounts, priv_data} = req.body
  const {linked, pendingCallContext, appInfo, linkId, linkedAt} 
    = await linker.linkWallet(walletToken, code, current_rpc, current_accounts, priv_data)

  res.send({linked, pending_call_context:pendingCallContext, 
    app_info:appInfo, link_id:linkId, linked_at:linkedAt})
})

router.post("/prelink-wallet/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const {pub_key, current_rpc, current_accounts, priv_data} = req.body
  const {code, linkId} 
    = await linker.prelinkWallet(walletToken, pub_key, current_rpc, current_accounts, priv_data)

  res.send({code, link_id:linkId})
})

router.post("/link-prelinked", async (req, res) => {
  const {code, link_id, return_url} = req.body
  const {clientToken, sessionToken, linked} 
    = await linker.linkPrelinked(code, link_id, req.useragent, return_url)

  clientTokenHandler(res, clientToken)
  res.send({session_token:sessionToken, linked})
})



router.get("/wallet-links/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const links = await linker.getWalletLinks(walletToken)
  res.send(links)
})


router.post("/wallet-update-links/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const {updates} = req.body
  const update_count = await linker.updateWalletLinks(walletToken, updates)
  res.send({update_count})
})


router.post("/eth-notify", async (req, res) => {
  const {receivers, token} = req.body
  if (token == NOTIFY_TOKEN)
  {
    linker.ethNotify(receivers)
  }
  res.send(true)
})

router.post("/unlink", async (req, res) => {
  const clientToken = getClientToken(req)
  const success = await linker.unlink(clientToken)
  res.send(success)
})

router.post("/unlink-wallet/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const {link_id} = req.body
  const success = await linker.unlinkWallet(walletToken, link_id)
  res.send(success)
})

router.post("/register-wallet-notification/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const {eth_address, device_type, device_token} = req.body
  const success = await linker.registerWalletNotification(walletToken, eth_address, device_type, device_token)
  res.send(success)
})


router.ws("/linked-messages/:sessionToken/:readId", async (ws, req) => {
  const clientToken = getClientToken(req)
  const {sessionToken, readId} = req.params
  //filter out sessionToken
  const realSessionToken = ["-", "null", "undefined"].includes(sessionToken)?null:sessionToken

  console.log(`Messages link sessionToken:${sessionToken} clientToken:${clientToken} readId:${readId}`)

  if (!clientToken){
    ws.close(1000, "No client token available.")
    return
  }

  //this prequeues some messages before establishing the connection
  try {
    const closeHandler = await linker.handleSessionMessages(clientToken, realSessionToken, readId, (msg, msgId) =>
      {
        ws.send(JSON.stringify({msg, msgId}))
      })
      ws.on("close", () => {
        closeHandler()
      })
  } catch(error) {
    console.log("we encountered an error:", error)
    ws.close(1000, error)
  }

  
})

router.ws("/wallet-messages/:walletToken/:readId", (ws, req) => {
  const {walletToken, readId} = req.params

  console.log(`Wallet messages link walletToken:${walletToken} readId:${readId}`)

  if (!walletToken) {
    ws.close()
  }

  const closeHandler = linker.handleMessages(walletToken, readId, (msg, msgId) =>
    {
      ws.send(JSON.stringify({msg, msgId}))
    })
  ws.on("close", () => {
    closeHandler()
  })
})


router.post("/submit-marketplace-onbehalf", async (req, res) => {
  const {cmd, params} = req.body

  const result = hot.submitMarketplace(cmd, params)
  res.send(result)
})

router.post("/verify-offer", async (req, res) => {
  const {offerId, params} = req.body
  const result = await hot.verifyOffer(offerId, params)
  res.send(result)
})


export default router
