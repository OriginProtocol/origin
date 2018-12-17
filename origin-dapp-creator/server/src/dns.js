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
export function _records(subdomain, ipfsHash) {
  return [
    zone.record('cname', {
      name: getDnsName(subdomain, 'cname'),
      data: 'dapp.originprotocol.com.',
      ttl: DEFAULT_TTL
    }),
    zone.record('txt', {
      name: getDnsName(subdomain, 'txt'),
      data: `dnslink=/ipfs/${ipfsHash}`,
      ttl: DEFAULT_TTL
    })
  ]
}

/*
 *
 *
 */
export function configureRecords(subdomain, ipfsHash) {
  const changes = {
    add: _records(subdomain, ipfsHash)
  }
  return zone.createChanges(changes)
}

export function deleteRecords(subdomain, ipfsHash) {
  const changes = {
    delete: _records(subdomain, ipfsHash)
  }
  return zone.createChanges(changes)
}
