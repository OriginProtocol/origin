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

router.get("/", (req, res) => res.send("Hello World!"))

router.ws("/",  (ws, req) => {
  console.log("Connection initialized...")
  ws.send("data")
})

router.post("/generate-code", (req, res) => {
  const clientToken = getClientToken(req)
  const {return_url, session_token, pending_call} = req.body
  const {clientToken, sessionToken, linkCode, linked} = linker.generateCode(clientToken, session_token, req.useragent, return_url, pending_call)
  clientTokenHandler(res, clientToken)
  res.send({session_token:sessionToken, link_code:linkCode, linked})
})

router.get("/link-info/:code", (req, res) => {
  const {code} = req.parameters
  // this is the context
  const {appInfo, linkId} = linker.getLinkInfo(code)
  res.send({app_info:appInfo, link_id:linkId})
})

router.post("/call-wallet/:sessionToken", (req, res) => {
  const clientToken = getClientToken(req)
  const {sessionToken} = req.parameters
  const {account, call, return_url} = req.body
  const success = linker.callWallet(clientToken, sessionToken, account, call, return_url)
  res.send({success})
})


router.post("/wallet-called/:walletToken", (req, res) => {
  const {walletToken} = req.parameters
  const {call_id, session_token, result} = req.body
  const success = linker.walletCalled(walletToken, call_id, session_token, call)
  res.send({success})
})

router.post("/link-wallet/:walletToken", (req, res) => {
  const {walletToken} = req.parameters
  const {code, current_rpc, current_accounts} = req.body
  const {returnUrl, linked, pendingCall, appInfo, linkId, linkedAt} 
    = linker.linkWallet(wallet_token, code, current_rpc, current_accounts)

  res.send({return_url:returnUrl, linked, pending_call:pendingCall, 
    app_info:appInfo, link_id:linkId, linked_at:linkedAt})
})

router.get("/wallet-links/:walletToken", (req, res) => {
  const {walletToken} = req.parameters
  const links = linker.getWalletLinks(walletToken)
    .map({linked, appInfo, linkId, linkedAt} => {linked, app_info:appInfo, link_id:link_id, linked_at:linkedAt})
  res.send(links)
})

router.post("/unlink", (req, res) => {
  const clientToken = getClientToken(req)
  const success = unlink(clientToken)
  res.send(success)
})

router.post("/unlink-wallet/:walletToken", (req, res) => {
  const {walletToken} = req.parameters
  const {link_id} = req.body
  const success = unlinkWallet(walletToken, link_id)
  res.send(success)
})

router.ws("/linked-messages/:sessionToken", (ws, req) => {
  const client_token = getClientToken(req)
  const {sessionToken} = req.parameters
  ws.on("message", message => {
    // {readId} mark last message...
    
  })
})

router.ws("/wallet-messages/:walletToken", (ws, req) => {
  const {walletToken} = req.parameters
  ws.on("message", message => {
    // {readId} mark last message...
    
  })
})

export default router
