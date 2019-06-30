const { DNS } = require('@google-cloud/dns')

const dns = new DNS({ projectId: process.env.GCLOUD_PROJECT })
const zone = dns.zone(process.env.GCLOUD_DNS_ZONE || 'test-zone')

export const subdomainBlacklist = ['admin', 'login', 'system', 'account']

/* Generates the DNS name of the CNAME and TXT entries.
 *
 * e.g. marketplace.origindapp.com
 *
 * @param {string} subdomain The subdomain of the DNS record.
 * @param {string} recordType The DNS record type.
 */
function getDnsName(subdomain, recordType) {
  const baseName = `${subdomain}.${
    process.env.DAPP_CREATOR_DOMAIN
  }.`.toLowerCase()
  if (recordType.toLowerCase() === 'cname') {
    return baseName
  } else if (recordType.toLowerCase() === 'txt') {
    return `config.${baseName}`
  }
}

/* Extract the IPFS hash from a dnslink= DNS entry.
 *
 * @param {string} data Data entry from a DNS txt record containing a dnslink.
 */
export function parseDnsTxtRecord(data) {
  // Strip surrounding quotes
  data = data.replace(/"/g, '')
  const prefix = 'dnslink=/ipfs/'
  return data.startsWith(prefix) ? data.slice(prefix.length) : false
}

/* Retrieve a DNS record for a subdomain and record type.
 *
 * @param {string} subdomain The subdomain of the DNS record.
 * @param {string} recordType the DNS record type.
 */
export function getDnsRecord(subdomain, recordType) {
  return new Promise((resolve, reject) => {
    zone
      .getRecordsStream()
      .on('error', reject)
      .on('data', record => {
        if (
          record.type == recordType &&
          record.name == getDnsName(subdomain, recordType)
        ) {
          resolve(record)
        }
      })
      .on('end', () => {
        // CNAME record not set for this subdomain
        resolve(undefined)
      })
  })
}

/* Helper method returning both the CNAME and TXT record for Google Cloud DNS.
 *
 * @param {string} subdomain The subdomain of the DNS records.
 * @param {string} ipfsHash The IPFS hash of the DApp configuration.
 */
export function _records(subdomain, ipfsHash) {
  return [_cnameRecord(subdomain), _txtRecord(subdomain, ipfsHash)]
}

/* Helper method to return the CNAME record for Google Cloud DNS.
 *
 * @param {string} subdomain The subdomain of the DNS record.
 */
export function _cnameRecord(subdomain) {
  return zone.record('cname', {
    name: getDnsName(subdomain, 'cname'),
    data: `${process.env.DAPP_HOSTNAME}.`,
    ttl: 86400
  })
}

/* Helper method to return the TXT record for Google Cloud DNS.
 *
 * @param {string} subdomain The subdomain of the DNS record.
 * @param {string} ipfsHash The IPFS hash of the DApp configuration.
 */
export function _txtRecord(subdomain, ipfsHash) {
  return zone.record('txt', {
    name: getDnsName(subdomain, 'txt'),
    data: `dnslink=/ipfs/${ipfsHash}`,
    ttl: 3600 // Low TTL so changes propagate quickly
  })
}

/* Adds all DNS records required for the DApp creator.
 *
 * @param {string} subdomain The subdomain of the DNS record.
 * @param {string} ipfsHash The IPFS hash of the DApp configuration.
 */
export function setAllRecords(subdomain, ipfsHash) {
  const changes = { add: _records(subdomain, ipfsHash) }
  return zone.createChange(changes)
}

/* Removes all DNS records required for the DApp creator.
 *
 * @param {string} subdomain The subdomain of the DNS record.
 * @param {string} ipfsHash The IPFS hash of the DApp configuration.
 */
export function deleteAllRecords(subdomain, ipfsHash) {
  const changes = {
    delete: _records(subdomain, ipfsHash)
  }
  return zone.createChange(changes)
}

/* Updates a single DNS TXT record by removing an old record and replacing it.
 *
 * @param {string} subdomain The subdomain of the DNS record.
 * @param {string} ipfsHash The IPFS hash of the DApp configuration.
 * @param {Record} oldRecord The old DNS record to remove
 */
export async function updateTxtRecord(subdomain, ipfsHash, oldRecord) {
  const changes = {
    delete: oldRecord,
    add: _txtRecord(subdomain, ipfsHash)
  }
  return zone.createChange(changes)
}
