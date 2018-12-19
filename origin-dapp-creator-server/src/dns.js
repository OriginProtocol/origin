const { DNS } = require('@google-cloud/dns')
const dns = new DNS({ projectId: process.env.GCLOUD_PROJECT_ID })
const zone = dns.zone(process.env.GCLOUD_DNS_ZONE)

/* Generates the name of the CNAME and TXT entries.
 *
 * @param `subdomain`
 */
function getDnsName(subdomain, recordType) {
  const baseName = `${subdomain}.${process.env.DAPP_CREATOR_DOMAIN}.`
  if (recordType.toLowerCase() === 'cname') {
    return baseName
  } else if (recordType.toLowerCase() === 'txt') {
    return `config.${baseName}`
  }
}

/* Extract the IPFS hash from a dnslink= DNS entry.
 *
 *
 */
export function parseDnsTxtRecord(data) {
  // Strip surrounding quotes
  data = data.replace(/"/g, '')
  const prefix = 'dnslink=/ipfs/'
  return data.startsWith(prefix) ? data.slice(prefix.length) : false
}

/*
 *
 *
 */
export function getDnsRecord(subdomain, recordType) {
  return new Promise((resolve, reject) => {
    zone.getRecordsStream()
      .on('error', reject)
      .on('data', record => {
        if (record.type == recordType && record.name == getDnsName(subdomain, recordType)) {
          resolve(record)
        }
      })
      .on('end', () => {
        // CNAME record not set for this subdomain
        resolve(undefined)
      })
  })
}

/*
 *
 *
 */
export function _records(subdomain, ipfsHash) {
  return [_cnameRecord(subdomain), _txtRecord(subdomain, ipfsHash)]
}

/*
 *
 *
 */
export function _cnameRecord(subdomain) {
  return zone.record('cname', {
    name: getDnsName(subdomain, 'cname'),
    data: 'dapp.originprotocol.com.',
    ttl: 86400
  })
}

/*
 *
 *
 */
export function _txtRecord(subdomain, ipfsHash) {
  return zone.record('txt', {
    name: getDnsName(subdomain, 'txt'),
    data: `dnslink=/ipfs/${ipfsHash}`,
    ttl: 3600 // Low TTL so changes propagate quickly
  })
}

/*
 *
 *
 */
export function setAllRecords(subdomain, ipfsHash) {
  const changes = { add: _records(subdomain, ipfsHash) }
  return zone.createChange(changes)
}

/*
 *
 *
 */
export function deleteAllRecords(subdomain, ipfsHash) {
  const changes = {
    delete: _records(subdomain, ipfsHash)
  }
  return zone.createChange(changes)
}

/*
 *
 *
 */
export async function updateTxtRecord(subdomain, ipfsHash, oldRecord) {
  const changes = {
    delete: oldRecord,
    add: _txtRecord(subdomain, ipfsHash)
  }
  return zone.createChange(changes)
}
