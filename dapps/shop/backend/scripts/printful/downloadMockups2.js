const qs = require('query-string')
const fetch = require('node-fetch')
const WebSocket = require('ws')
const ReconnectingWebSocket = require('reconnecting-websocket')

const parsed = {
  'designData[additionalGeneratorVariantIds]': '',
  'designData[arePrintfilesHidden]': '0',
  'designData[categoryIds]': '',
  'designData[colors][0]': 'White',
  'designData[defaultGeneratorVariantId]': '2704',
  'designData[filesIdsByPlacement][belt_back][]': '192209009',
  'designData[filesIdsByPlacement][default][]': '192209009',
  'designData[forceOrientation]': '',
  'designData[forceTemplateType]': '',
  'designData[genderCategory]': '',
  'designData[generatorDesignId]': '',
  'designData[generatorVariantsIdsToSave][0]': '15710',
  'designData[generatorVariantsIdsToSave][1]': '15713',
  'designData[generatorVariantsIdsToSave][2]': '15712',
  'designData[isFreeShippingEnabled]': '0',
  'designData[isTransparent]': '1',
  'designData[isVisible]': '1',
  'designData[multipleMockups]': '0',
  'designData[productId]': '242',
  'designData[productOptions][inside_pocket]': '',
  'designData[productOptions][stitch_color]': 'white',
  'designData[rawPlacementOptions][0][placement]': 'default',
  'designData[rawPlacementOptions][1][placement]': 'belt_front',
  'designData[rawPlacementOptions][2][placement]': 'belt_back',
  'designData[rawPlacementOptions][3][placement]': 'label_inside',
  'designData[sizeGuideUnits][0]': 'imperial',
  'designData[sizes][0]': 'XS',
  'designData[sizes][1]': 'S',
  'designData[sizes][2]': 'M',
  'designData[sizes][3]': 'L',
  'designData[sizes][4]': 'XL',
  'designData[storeId]': '0',
  'designData[templates][belt_back_83][layers][0][customizeKey]': '0',
  'designData[templates][belt_back_83][layers][0][embroideryType]': '',
  'designData[templates][belt_back_83][layers][0][fileId]': '192209009',
  'designData[templates][belt_back_83][layers][0][flipX]': 'false',
  'designData[templates][belt_back_83][layers][0][flipY]': 'false',
  'designData[templates][belt_back_83][layers][0][isCustomizable]': '0',
  'designData[templates][belt_back_83][layers][0][isEmbroideryAfterMigration]':
    '',
  'designData[templates][belt_back_83][layers][0][isExisting]': '',
  'designData[templates][belt_back_83][layers][0][isUpscaled]': '',
  'designData[templates][belt_back_83][layers][0][migratedToNewPicker]': '',
  'designData[templates][belt_back_83][layers][0][overrideColors]': '',
  'designData[templates][belt_back_83][layers][0][overrideImagePulse]': '',
  'designData[templates][belt_back_83][layers][0][overrideImage]': '',
  'designData[templates][belt_back_83][layers][0][parentLayerUniqueId]': '',
  'designData[templates][belt_back_83][layers][0][patternSpacing]': '',
  'designData[templates][belt_back_83][layers][0][patternType]': '',
  'designData[templates][belt_back_83][layers][0][position][areaHeight]':
    '5.999999999999998',
  'designData[templates][belt_back_83][layers][0][position][areaWidth]': '16',
  'designData[templates][belt_back_83][layers][0][position][height]':
    '2.399833948339483',
  'designData[templates][belt_back_83][layers][0][position][left]':
    '6.978861254612545',
  'designData[templates][belt_back_83][layers][0][position][rotation]': '0',
  'designData[templates][belt_back_83][layers][0][position][top]':
    '2.08790701107011',
  'designData[templates][belt_back_83][layers][0][position][width]':
    '2.0458583025830257',
  'designData[templates][belt_back_83][layers][0][type]': 'file',
  'designData[templates][belt_back_83][layers][0][uniqueId]': '12',
  'designData[templates][belt_back_83][placementId]': 'belt_back',
  'designData[templates][belt_back_83][placementName]': 'Back waist',
  'designData[templates][belt_back_83][technique]': 'CUT-SEW',
  'designData[templates][belt_back_83][templateId]': '83',
  'designData[templates][default_81][layers][0][customizeKey]': '0',
  'designData[templates][default_81][layers][0][embroideryType]': '',
  'designData[templates][default_81][layers][0][fileId]': '192209009',
  'designData[templates][default_81][layers][0][flipX]': 'false',
  'designData[templates][default_81][layers][0][flipY]': 'false',
  'designData[templates][default_81][layers][0][isCustomizable]': '0',
  'designData[templates][default_81][layers][0][isEmbroideryAfterMigration]':
    '',
  'designData[templates][default_81][layers][0][isExisting]': '',
  'designData[templates][default_81][layers][0][isUpscaled]': '',
  'designData[templates][default_81][layers][0][migratedToNewPicker]': '',
  'designData[templates][default_81][layers][0][overrideColors]': '',
  'designData[templates][default_81][layers][0][overrideImagePulse]': '',
  'designData[templates][default_81][layers][0][overrideImage]': '',
  'designData[templates][default_81][layers][0][parentLayerUniqueId]': '',
  'designData[templates][default_81][layers][0][patternSpacing]': '',
  'designData[templates][default_81][layers][0][patternType]': '',
  'designData[templates][default_81][layers][0][position][areaHeight]': '41',
  'designData[templates][default_81][layers][0][position][areaWidth]': '47',
  'designData[templates][default_81][layers][0][position][height]':
    '11.590661775000001',
  'designData[templates][default_81][layers][0][position][left]':
    '29.932599221183796',
  'designData[templates][default_81][layers][0][position][rotation]': '0',
  'designData[templates][default_81][layers][0][position][top]':
    '10.0426753894081',
  'designData[templates][default_81][layers][0][position][width]': '9.87',
  'designData[templates][default_81][layers][0][type]': 'file',
  'designData[templates][default_81][layers][0][uniqueId]': '2',
  'designData[templates][default_81][placementId]': 'default',
  'designData[templates][default_81][placementName]': 'Print file',
  'designData[templates][default_81][technique]': 'CUT-SEW',
  'designData[templates][default_81][templateId]': '81',
  'designData[title]': 'Yoga Leggings',
  'designData[translationLanguage]': '',
  'designData[useSizeConversion]': '1',
  'designData[withSizeGuide]': '1',
  downloadOnly: '1',
  forLiveMockup: '0'
}

const body = qs.stringify(parsed)

async function post(url, body) {
  const res = await fetch(url, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      'x-csrf-token': '',
      cookie: '_session=xxx; _csrf=xxx'
    },
    body,
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })
  const json = await res.json()
  console.log(JSON.stringify(json, null, 2))
  return json
}

async function go() {
  const json = await post(
    'https://www.printful.com/rpc/product-generator-rpc/push-product',
    body
  )

  if (!json || !json.result) {
    return
  }

  const ws = new ReconnectingWebSocket(
    'wss://ws-mt1.pusher.com/app/ad0dd572bad404ab9f65?protocol=7&client=js&version=3.1.0&flash=false',
    [],
    { WebSocket }
  )

  ws.addEventListener('error', err => {
    console.log('WS error:', err.message)
  })
  ws.addEventListener('close', function clear() {
    console.log('WS closed.')
  })

  ws.addEventListener('open', function open() {
    console.log('WS open.')
  })

  ws.addEventListener('message', async function incoming(raw) {
    const parsed = JSON.parse(raw.data)
    console.log('message', parsed)
    if (parsed.event === 'onSuccess') {
      const data = JSON.parse(parsed.data)
      console.log('onSuccess', data)

      await post(
        'https://www.printful.com/rpc/product-generator-rpc/get-generated-files',
        qs.stringify({ cacheKey: data })
      )
    }
  })

  ws.send(
    JSON.stringify({
      event: 'pusher:subscribe',
      data: { channel: json.result.taskPusherKey }
    })
  )
}

go()
