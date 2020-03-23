require('dotenv').config()
const SDK = require('@uphold/uphold-sdk-javascript').default

const uphold = new SDK({
  baseUrl: 'https://api-sandbox.uphold.com',
  clientId: process.env.UPHOLD_CLIENT,
  clientSecret: process.env.UPHOLD_SECRET
})

uphold.storage.setItem('uphold.access_token', process.env.UPHOLD_TOKEN)

async function go() {
  const me = await uphold.getMe()
  console.log(`Logged in as ${me.email}`)

  const cards = await uphold.getCards()
  cards.items.forEach(card => {
    // console.log(card)
    const norm = card.normalized.find(n => n.currency === 'USD')
    console.log(`${card.label}: $${norm.balance} (${card.balance} ${card.currency})`)
  })

  // const usdCard = cards.items.find(c => c.label === 'USD account')
  // console.log(`Card '${usdCard.currency}' has balance of ${usdCard.balance}`)
  // try {
  //   const tx = await uphold.createCardTransaction(
  //     usdCard.id,
  //     {
  //       amount: 1,
  //       currency: 'USD',
  //       destination: process.env.UPHOLD_CLIENT
  //     },
  //     true
  //   )
  //   console.log(tx)
  // } catch (e) {
  //   console.log(JSON.stringify(e.body, null, 2))
  // }
}

go()
