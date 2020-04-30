/* eslint-disable */

const fs = require('fs')
const fetch = require('node-fetch')
const get = require('lodash/get')
const https = require('https')

const downloadMockups = require('./downloadMockups')

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
  console.log(JSON.stringify(variantPrintfile, null, 2))
  console.log(JSON.stringify(printFiles.result.option_groups, null, 2))
  console.log(JSON.stringify(printFiles.result.options, null, 2))

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

  const mockupTask = {
    variant_ids: [8554, 8355],
    // variant_ids: [variantId],
    format: 'jpg',
    product_options: {
      stitch_color: 'white',
      inside_pocket: '1'
    },
    // option_groups: printFiles.result.option_groups,
    // options: printFiles.result.options,
    option_groups: ['Default'],
    options: ['Back', 'Back waist'],
    files: files
  }

  console.log(JSON.stringify(mockupTask, null, 4))
  // return

  const res = await fetch(
    `${PrintfulURL}/mockup-generator/create-task/${productId}`,
    {
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${apiAuth}`
      },
      method: 'POST',
      body: JSON.stringify(mockupTask)
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

module.exports = getMockups
