const fs = require('fs')
const get = require('lodash/get')
const https = require('https')

async function getMockups({ PrintfulURL, apiAuth, OutputDir, id }) {
  const dataRaw = fs.readFileSync(
    `${OutputDir}/data-printful/product-${id}-internal.json`
  )
  const data = JSON.parse(dataRaw)
  const productId = data.result.products[0].productId
  const syncVariant = data.result.syncVariants[0]
  const variantId = syncVariant.variantId

  const printFilesPath = `${OutputDir}/data-printful/printfiles-${productId}.json`
  let printFiles = []
  if (!fs.existsSync(printFilesPath)) {
    const res = await fetch(
      `${PrintfulURL}/mockup-generator/printfiles/${productId}`,
      {
        headers: {
          'content-type': 'application/json',
          authorization: `Basic ${apiAuth}`
        },
        method: 'GET'
      }
    )
    printFiles = await res.json()
    fs.writeFileSync(printFilesPath, JSON.stringify(printFiles, null, 2))
  } else {
    const printFilesRaw = fs.readFileSync(printFilesPath)
    printFiles = JSON.parse(printFilesRaw)
  }

  const mockTplPath = `${OutputDir}/data-printful/mocktpl-${productId}.json`
  let mockTemplates = []
  if (!fs.existsSync(mockTplPath)) {
    const res = await fetch(
      `${PrintfulURL}/mockup-generator/templates/${productId}`,
      {
        headers: {
          'content-type': 'application/json',
          authorization: `Basic ${apiAuth}`
        },
        method: 'GET'
      }
    )
    mockTemplates = await res.json()
    fs.writeFileSync(mockTplPath, JSON.stringify(mockTemplates, null, 2))
  } else {
    const mockTemplatesRaw = fs.readFileSync(mockTplPath)
    mockTemplates = JSON.parse(mockTemplatesRaw)
  }

  const variantMapping = mockTemplates.result.variant_mapping.find(
    p => p.variant_id === variantId
  )
  const variantTemplates = variantMapping.templates.map(t => {
    const template = mockTemplates.result.templates.find(
      tpl => tpl.template_id === t.template_id
    )
    return {
      ...t,
      ...template
    }
  })
  // console.log(JSON.stringify(variantMapping, null, 2))
  // console.log(JSON.stringify(variantTemplates, null, 2))

  const variantPrintfile = printFiles.result.variant_printfiles.find(
    p => p.variant_id === variantId
  )
  // console.log(JSON.stringify(variantPrintfile, null, 2))
  // console.log(JSON.stringify(printFiles.result.option_groups, null, 2))
  // console.log(JSON.stringify(printFiles.result.options, null, 2))

  const design = syncVariant.orderLineItem.design
  // console.log(JSON.stringify(design, null, 2))
  const placements = Object.keys(design.placements)
  const files = []
  for (const placement of placements) {
    // console.log(placement)
    const tplId = Object.keys(design.placements[placement])
    const layer = design.placements[placement][tplId[0]].layers[0]
    // console.log(layer.fileItem.urlFullSize)
    // console.log(layer.position)
    const placementTpl = variantTemplates.find(t => t.placement === placement)
    // console.log(placementTpl)
    files.push({
      placement,
      image_url: layer.fileItem.urlFullSize,
      position: {
        area_width: placementTpl.print_area_width,
        area_height: placementTpl.print_area_height,
        width: Math.round(
          (layer.position.width / layer.position.areaWidth) *
            placementTpl.print_area_width
        ),
        height: Math.round(
          (layer.position.height / layer.position.areaHeight) *
            placementTpl.print_area_height
        ),
        top: Math.round(
          (layer.position.top / layer.position.areaHeight) *
            placementTpl.print_area_height
        ),
        left: Math.round(
          (layer.position.left / layer.position.areaWidth) *
            placementTpl.print_area_width
        )
      }
    })
  }

  const res = await fetch(
    `${PrintfulURL}/mockup-generator/create-task/${productId}`,
    {
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${apiAuth}`
      },
      method: 'POST',
      body: JSON.stringify({
        variant_ids: [variantId],
        format: 'jpg',
        option_groups: printFiles.result.option_groups,
        files
      })
    }
  )
  const json = await res.json()
  console.log(JSON.stringify(json, null, 2))
  const { task_key, status } = json.result
  console.log(`${PrintfulURL}/mockup-generator/task?task_key=${task_key}`)

  // await new Promise(resolve => setTimeout(resolve, 5000))
  let taskJson = {}

  while (get(taskJson, 'result.status') !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const taskRes = await fetch(
      `${PrintfulURL}/mockup-generator/task?task_key=${task_key}`,
      {
        headers: {
          'content-type': 'application/json',
          authorization: `Basic ${apiAuth}`
        },
        method: 'GET'
      }
    )
    taskJson = await taskRes.json()
    if (get(taskJson, 'result.status') !== 'completed') {
      console.log(JSON.stringify(taskJson, null, 2))
    }
  }
  if (get(taskJson, 'result.status') === 'completed') {
    await downloadMockups({ OutputDir, id, taskJson })
  }
  console.log(JSON.stringify(taskJson, null, 2))
  // console.log(JSON.stringify(design.placements, null, 2))
}

async function downloadMockups({ OutputDir, id, taskJson }) {
  const files = []
  taskJson.result.mockups.forEach(mockup => {
    files.push({
      name: `${mockup.placement}.jpg`,
      url: mockup.mockup_url
    })
    mockup.extra.forEach(extra => {
      files.push({
        name: `${mockup.placement}-${extra.option_group
          .toLowerCase()
          .replace(/ +/g, '-')
          .replace(/[^0-9a-z-]/g, '')}-${extra.option
          .toLowerCase()
          .replace(/ +/g, '-')
          .replace(/[^0-9a-z-]/g, '')}.jpg`,
        url: extra.url
      })
    })
  })
  const prefix = `${OutputDir}/images-printful/product-${id}`
  for (const file of files) {
    fs.mkdirSync(prefix, { recursive: true })

    const f = fs.createWriteStream(`${prefix}/${file.name}`)
    https.get(file.url, response => response.pipe(f))
  }
}

module.exports = getMockups
