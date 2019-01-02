require('dotenv').config()

import {
  getDnsRecord,
  setDnsRecord
} from './src/dns.js'


getDnsRecord('tom', 'CNAME').then((result) => {
  setDnsRecord('tom', 'CNAME', 'originprotocol.com.', result)
}).catch('error', console.log)
