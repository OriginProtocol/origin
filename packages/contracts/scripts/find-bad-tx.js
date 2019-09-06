const superagent = require('superagent')

const Contract = '819bb9964b6ebf52361f1ae42cf4831b921510f9'
async function getPage(start, length = 100) {
  const response = await superagent
    .get(`https://www.etherchain.org/account/${Contract}/txs`)
    .set('User-Agent', 'curl/7.54.0')
    .set('accept', 'application/json')
    .query({ draw: 1, start, length })
  // console.log(`Requesting tx ${start} to ${start + length}`)
  let last
  response.body.data.forEach(tx => {
    if (tx.failed) {
      const hash = tx.parenthash.match(/<a href='\/tx\/([^']+)/)
      if (hash[1] !== last) {
        const block = tx.blocknumber.match(/<a href='\/block\/([^']+)/)
        console.log(`Tx ${hash[1]} at block ${block[1]} ${tx.time}`)
        last = hash[1]
      }
    }
  })
}

async function getPages() {
  await getPage(0)
  await getPage(100)
  await getPage(200)
  await getPage(300)
  await getPage(400)
  await getPage(500)
}

getPages()
