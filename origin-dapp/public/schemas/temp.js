// const fs = require('fs')

// const files = fs.readdirSync(__dirname)
// const schemas = files.filter(file => /\.json/.test(file))
// schemas.forEach(schema => {
//   const renamed = schema.replace('1-0-0', '1.0.0')
//   fs.renameSync(schema, renamed)
// })

const fs = require('fs')
const files = fs.readdirSync(__dirname)
const schemas = files.filter(file => /\.json/.test(file))
const messages = {}

schemas.map(schema => {
  const buf = fs.readFileSync(schema)
  const json = JSON.parse(buf.toString())
  
  // json.required = json.required.filter(prop =>
  //   prop !== 'dappSchemaId' &&
  //   prop !== 'listingType' &&
  //   prop !== 'category' &&
  //   prop !== 'slotLength' &&
  //   prop !== 'slotLengthUnit'
  // )

  // const id = json.properties.dappSchemaId.const
  // json.properties.dappSchemaId.const = id.replace('-1.0.0', '_1.0.0')

  // const category = json.properties.category.const
  // json.properties.category.const = category.replace('schema.', '')
  // json.properties.category.const = category.replace('for-rent', 'forRent')
  // json.properties.category.const = category.replace('for-sale', 'forSale')

  // const slotLenUnit = json.properties.slotLengthUnit && json.properties.slotLengthUnit.enum
  // if (slotLenUnit) {
  //   json.properties.slotLengthUnit.enum = slotLenUnit.map(item => `schema.${item}`)
  //   json.properties.slotLengthUnit.default = `schema.${json.properties.slotLengthUnit.default}`
  // }

  // const id = json.properties.dappSchemaId.const
  // json.properties.dappSchemaId.const = `https://dapp.originprotocol.com/schemas/${id}.json`

  // const subCat = schema.substring(schema.indexOf('-') + 1, schema.indexOf('_1.0.0.json'))
  // json.properties.subCategory = {
  //   const: `schema.${subCat}`
  // }
  
  // messages[`schema.${subCat}`] = {
  //   id: `schema.${subCat}`,
  //   defaultMessage: subCat.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase() })
  // }

  // const cat = json.properties.category.const
  // json.properties.category = {
  //   const: `schema.${cat}`
  // }

  // const unitsTotal = json.properties.unitsTotal
  // if (unitsTotal) {
  //   json.properties.unitsTotal.type = 'integer'
  // }

  // const unitsTotal = json.properties.unitsTotal
  // const type = json.properties.listingType.const
  // if (type === 'fractional') {
    // delete json.properties.unitsTotal

  // }

  // const cat = json.properties.category.const
  // if (cat === 'schema.services') {
  //   json.required = json.required.filter(prop => prop !== 'price')
  //   delete json.properties.price
  // }

  const cat = json.properties.category.const
  if (cat === 'schema.services') {
    json.required = [...json.required, 'price']
    json.properties.price = {
      type: 'number',
      title: 'schema.priceInETH'
    }
    json.properties.listingType.const = 'unit'
  }

  fs.writeFileSync(schema, JSON.stringify(json, null, 2))
})

// console.log(JSON.stringify(messages, null, 2))


