import express from 'express'
import expressWs from 'express-ws'
import Linker from './logic/linker'

const router = express.Router()
//doing this is a hack for detached routers...
expressWs(router)

const CLIENT_TOKEN_COOKIE = "ct"

const getClientToken = req => {
  return req.cookies[CLIENT_TOKEN_COOKIE]
}

const clientTokenHandler = (res, clientToken) => {
  if (clientToken) {
    res.cookie(CLIENT_TOKEN_COOKIE, clientToken, {expires:new Date(Date.now() + 15 * 24 * 3600 * 1000), httpOnly:true})
  }
}

const linker = new Linker()

router.post("/generate-code", async (req, res) => {
  const _clientToken = getClientToken(req)
  const {return_url, session_token, pending_call} = req.body
  const {clientToken, sessionToken, code, linked} = await linker.generateCode(_clientToken, session_token, req.useragent, return_url, pending_call)
  clientTokenHandler(res, clientToken)
  res.send({session_token:sessionToken, link_code:code, linked})
})

router.get("/link-info/:code", async (req, res) => {
  const {code} = req.params
  // this is the context
  const {appInfo, linkId} = await linker.getLinkInfo(code)
  res.send({app_info:appInfo, link_id:linkId})
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
  const {code, current_rpc, current_accounts} = req.body
  const {linked, pendingCallContext, appInfo, linkId, linkedAt} 
    = await linker.linkWallet(walletToken, code, current_rpc, current_accounts)

  res.send({linked, pending_call_context:pendingCallContext, 
    app_info:appInfo, link_id:linkId, linked_at:linkedAt})
})

router.get("/wallet-links/:walletToken", async (req, res) => {
  const {walletToken} = req.params
  const links = await linker.getWalletLinks(walletToken)
    .map(({linked, appInfo, linkId, linkedAt}) => ({linked, app_info:appInfo, link_id:link_id, linked_at:linkedAt}))
  res.send(links)
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
  const closeHandler = await linker.handleSessionMessages(clientToken, realSessionToken, readId, (msg, msgId) =>
    {
      ws.send(JSON.stringify({msg, msgId}))
    })

  ws.on("close", () => {
    closeHandler()
  })

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

export default router
