const { DNS } = require('@google-cloud/dns')
const dns = new DNS({ projectId: process.env.GCLOUD_PROJECT_ID })
const zone = dns.zone(process.env.GCLOUD_DNS_ZONE)
const DEFAULT_TTL = 3600

/* Generates the name of the CNAME and TXT entries.
 *
 * @param `subdomain`
 */
function getDnsName(subdomain, recordType) {
  const baseName = `${subdomain}.${process.env.DAPP_CREATOR_DOMAIN}.`
  if (recordType.toLowerCase() === 'cname') {
    return baseName
  } else if (recordType.toLowerCase() === 'txt') {
    return `origin.${baseName}`
  }
}

/* Extract the IPFS hash from a dnslink= DNS entry.
 *
 *
 */
export function parseDnsTxtRecord(data) {
  const prefix = 'dnslink='
  return data.startswith(prefix) ? data.slice(prefix.length) : false
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
export function createRecord(subdomain, recordType, data) {
  const name = getDnsName(subdomain, recordType)
  return zone.record(recordType, {
    name: name,
    data: data,
    ttl: DEFAULT_TTL
  })
}

/*
 *
 *
 */

export function configureRecords(subdomain, ipfsHash) {
  let changes = {}
  changes.add = []
  changes.add.push(createRecord(subdomain, 'CNAME', 'dapp.originprotocol.com.'))
  changes.add.push(createRecord(subdomain, 'TXT', `dnslink=/ipfs/${ipfsHash}`))
  return executeChanges(changes)
}

export function deleteRecords(subdomain) {
}

export function executeChanges(changes) {
  return zone.createChange(changes)
}

