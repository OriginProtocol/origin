require('dotenv').config()
const fetch = require('node-fetch')

const PrintfulApiKey = process.env.PRINTFUL

const apiAuth = Buffer.from(PrintfulApiKey).toString('base64')
const PrintfulURL = 'https://api.printful.com'

async function createOrder() {
  const res = await fetch(`${PrintfulURL}/orders`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      external_id: 'TEST-123',
      recipient: {
        name: 'Test 123',
        address1: '123 Main St',
        city: 'Palo Alto',
        state_code: 'CA',
        country_code: 'US',
        zip: '94301'
      },
      items: [
        {
          sync_variant_id: 1310174611,
          quantity: 1
        }
      ]
    })
  })
  const json = await res.json()
  console.log(json)
}

async function confirmOrder(id) {
  const res = await fetch(`${PrintfulURL}/orders/${id}/confirm`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    credentials: 'include',
    method: 'POST'
  })
  const json = await res.json()
  console.log(json)
}

async function getSyncProducts() {
  const res = await fetch(`${PrintfulURL}/sync/products?limit=100`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(json)
}

async function getSyncProduct(id) {
  const res = await fetch(`${PrintfulURL}/sync/products/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}

async function getSyncVariant(id) {
  const res = await fetch(`${PrintfulURL}/sync/variant/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}

async function getPrintFiles(id) {
  const res = await fetch(`${PrintfulURL}/mockup-generator/printfiles/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}

async function createMockupTask(id, data) {
  const res = await fetch(`${PrintfulURL}/mockup-generator/create-task/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'POST',
    body: JSON.stringify(data)
  })
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}
async function getTask(id) {
  const res = await fetch(
    `${PrintfulURL}/mockup-generator/task?task_key=${id}`,
    {
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${apiAuth}`
      },
      method: 'GET'
    }
  )
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}

async function getFiles() {
  const res = await fetch(`${PrintfulURL}/files`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}

async function getFile(id) {
  const res = await fetch(`${PrintfulURL}/files/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}
async function getMockTemplate(id) {
  const res = await fetch(`${PrintfulURL}/mockup-generator/templates/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(JSON.stringify(json.result, null, 2))
}

// createOrder()
// confirmOrder('25224837')
// getSyncProducts()
// getSyncProduct(116035497)
getSyncVariant(1310137968)
// getMockTemplate(71)
// getPrintFiles(71)
// createMockupTask(71, {
//   variant_ids: [8466],
//   format: 'jpg',
//   option_groups: ["Men's"],
//   files: [
//     {
//       placement: 'front',
//       image_url:
//         'https://files.cdn.printful.com/files/cd3/cd3547ed568ff559f8071ba12fffe15e_preview.png',
//       position: {
//         area_width: 1800,
//         area_height: 2400,
//         width: 1768,
//         height: 2015,
//         top: 0,
//         left: 0
//       }
//     },
//     {
//       placement: 'back',
//       image_url:
//         'https://files.cdn.printful.com/files/0ac/0acbe8ff13b0429e4a951deb267512b3_preview.png',
//       position: {
//         area_width: 1800,
//         area_height: 2400,
//         width: 1800,
//         height: 575,
//         top: 0,
//         left: 0
//       }
//     }
//   ]
// })
// getTask('za5104e6c3414f18f3b912e154ebe1f1')
// getFiles()
// getFile(153461378)
