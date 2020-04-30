const cloudflare = require('cloudflare')
const find = require('lodash/find')

async function findZone(cf, conditions) {
  const data = { page: 1, per_page: 100 }
  let response, found
  do {
    response = await cf.zones.browse(data)
    found = find(response.result, conditions)
    data.page = response.result_info.page + 1
  } while (
    !found &&
    response.result_info.page <= response.result_info.total_pages
  )
  return found
}

async function findRecord(cf, id, conditions) {
  const data = { page: 1, per_page: 100 }
  let response, found
  do {
    response = await cf.dnsRecords.browse(id, data)
    found = find(response.result, conditions)
    data.page = response.result_info.page + 1
  } while (
    !found &&
    response.result_info.page <= response.result_info.total_pages
  )
  return found
}

async function setRecords({ email, key, zone, subdomain, ipfsGateway, hash }) {
  const cf = cloudflare({ email, key })

  const zoneObj = await findZone(cf, { name: zone })
  if (!zoneObj) {
    console.log(`Zone ${zone} not found.`)
    return
  }
  const zoneId = zoneObj.id
  console.log(`Found zone ${zoneObj.name} ID ${zoneObj.id}`)

  const record = `${subdomain}.${zone}`
  const cname = await findRecord(cf, zoneId, { type: 'CNAME', name: record })
  if (!cname) {
    console.log(`Adding CNAME ${record}`)
    await cf.dnsRecords.add(zoneId, {
      type: 'CNAME',
      name: record,
      content: ipfsGateway
    })
  } else {
    console.log(`CNAME ${record} exists pointing to ${cname.content}`)
  }

  const dnslink = `_dnslink.${record}`
  const txt = await findRecord(zoneObj.id, { type: 'TXT', name: dnslink })
  const content = `dnslink=/ipfs/${hash}`
  if (!txt) {
    console.log(`Adding TXT ${dnslink} to ${content}`)
    await cf.dnsRecords.add(zoneObj.id, {
      type: 'TXT',
      name: dnslink,
      content,
      ttl: 120
    })
  } else {
    console.log(`TXT ${dnslink} exists pointing to ${txt.content}`)
    if (txt.content !== content) {
      txt.content = content
      console.log(`Updating TXT to ${content}`)
      await cf.dnsRecords.edit(zoneObj.id, txt.id, txt)
    }
  }
}

module.exports = setRecords

// setRecords({
//   email: 'email@example.com',
//   key: 'abc123'
//   zone: 'example.com',
//   subdomain: 'www',
//   ipfsGateway: 'ipfs-prod.ogn.app',
//   ipfsHash: ''
// })
