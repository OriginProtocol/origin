import SDK from '@uphold/uphold-sdk-javascript'

const uphold = new SDK({
  baseUrl: 'https://api-sandbox.uphold.com',
  clientId: process.env.UPHOLD_CLIENT,
  clientSecret: process.env.UPHOLD_SECRET
})

uphold.storage.setItem('uphold.access_token', process.env.UPHOLD_TOKEN)

async function go() {
  const me = await uphold.getMe()
  console.log(me)

  const cards = await uphold.getCards()
  const usdCard = cards.items.find(c => c.label === 'USD account')
  console.log(usdCard)
  try {
    const tx = await uphold.createCardTransaction(
      usdCard.id,
      {
        amount: 1,
        currency: 'USD',
        destination: 'nick@originprotocol.com'
      },
      true
    )
    console.log(tx)
  } catch (e) {
    console.log(JSON.stringify(e.body, null, 2))
  }
}

go()
