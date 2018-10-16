import express from 'express'
import expressWs from 'express-ws'
expressWs({})
const router = express.Router()

const CLIENT_TOKEN_COOKIE = "ct"

const getClientToken = req => {
  return req.cookies[CLIENT_TOKEN_COOKIE]
}

const clientTokenHandler = (res, clientToken) => {
  if (clientToken) {
    res.cookie(CLIENT_TOKEN_COOKIE, clientToken, {expires:new Date(Date.now() + 15 * 24 * 3600 * 1000), httpOnly:true})
  }
}


router.get("/", (req, res) => res.send("Hello World!"))

router.ws("/",  (ws, req) => {
  console.log("Connection initialized...")
  ws.send("data")
})

router.post("/generate-code", (req, res) => {
  const client_token = getClientToken(req)
  const {return_url, session_token, pending_call} = req.body
  const {out_client_token, out_session_token, link_code, linked} = generateCode(client_token, session_token, return_url, pending_call)
  clientTokenHandler(res, out_client_token)
  res.send({out_session_token, link_code, linked})
})


router.ws("/linked-messages/:sessionToken", (ws, req) => {
  const client_token = getClientToken(req)
  const {sessionToken} = request.parameters
  ws.on("message", message => {
  })
})


export default router
