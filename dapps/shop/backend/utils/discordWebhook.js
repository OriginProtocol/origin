const fetch = require('node-fetch')

const url = process.env.DISCORD_WEBHOOK

module.exports = function({ shopName, orderId, total, items = [] }) {
  if (!url) {
    return
  }

  const allItems = items.join(', ')
  const content = `Order #${orderId} on '${shopName}' for ${total}: ${allItems}`
  console.log(`Discord webhook: ${content}`)
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })
    .then(res => {
      console.log(`Discord webhook OK: ${res.ok}`)
    })
    .catch(err => {
      console.log('Discord webhook err:', err)
    })
}
