const { DNS } = require('@google-cloud/dns')

const dns = new DNS({ projectId: process.env.GCLOUD_PROJECT_ID })

const DEFAULT_TTL = 3600

function getDnsName(subdomain) {
  return `${subdomain}.${process.env.DAPP_CREATOR_DOMAIN}.`
}

export function getDnsRecord(subdomain, recordType) {
  const zone = dns.zone(process.env.GCLOUD_DNS_ZONE)
  return new Promise((resolve, reject) => {
    zone.getRecordsStream()
      .on('error', reject)
      .on('data', record => {
        if (record.type == recordType && record.name == getDnsName(subdomain)) {
          resolve(record)
        }
      })
      .on('end', () => {
        // CNAME record not set for this subdomain
        reject('No records found')
      })
  })
}

export function setDnsRecord(subdomain, recordType, data, oldRecord) {
  const zone = dns.zone(process.env.GCLOUD_DNS_ZONE)
  const record = zone.record('cname', {
    name: getDnsName(subdomain),
    data: data,
    ttl: DEFAULT_TTL
  })

  const changes = { add: record }
  if (oldRecord) {
    changes.delete = oldRecord
  }

  return zone.createChange(changes)
}
