// Iterates over files in `translation/crowdin` over our languages, expecting them to be in key-value format that crowdin uses
// Output: files in fbt formatin in `translations` dir
//

const doTestMark = process.argv.length>=3 && process.argv[2]=='doTestMark'
if (doTestMark) {
  console.warn('⚠️ Doing translation with test marks included for testing.')
}

const locales = 'de_DE el_GR es_ES fil_PH fr_FR hr_HR id_ID it_IT ja_JP ko_KR nl_NL pt_PT ro_RO ru_RU th_TH tr_TR uk_UA vi_VN zh_CN zh_TW'.split(
  ' '
)

// Decodes variable names from crowdin into their original name.
// See encoding format in fbtToCrowdin.js
const EqualPrefix = 'E_'
const VarPrefix = 'VAR_'
const b64Prefix = '_B64_'

function b64Decode(data) {
  // The "/" and "+" characters cause MT to alter
  // the data so they were replace during encoding.
  const b64Encoded = data
    .replace(/SLASH/g, '/')
    .replace(/PLUS/g, '+')
  return new Buffer(b64Encoded, 'base64').toString()
}

function decodeVarName(encodedVarName) {
  let data = encodedVarName

  if (data.startsWith(EqualPrefix)) {
    data = data.slice(EqualPrefix.length)
  }

  if (!data.startsWith(VarPrefix)) {
    throw new Error(`Unexpected variable format. Missing prefix ${VarPrefix}. Var=${encodedVarName}`)
  }
  data = data.slice(VarPrefix.length)

  // Extract the parts from the encoded variable name.
  const parts = data.split(b64Prefix)
  if (parts.length !== 2) {
    throw new Error(`Unexpected variable format. Expected 2 parts. Var=${encodedVarName}`)
  }

  // Base64 decode the variable name.
  const b64 = parts[1]
  const originalVarName = b64Decode(b64)

  return originalVarName
}


function decode(str) {
  // Special case where the entire string was just concatenated variables.
  if (str.startsWith('{' + VarPrefix) && str.endsWith('}')) {
    const decodedStr = b64Decode(str)
    return '{' + decodedStr + '}'
  }

  let out=''
  let encodedVarName = ''
  let inBracket = false
  for (let i = 0; i < str.length; i++) {
    const cur = str.charAt(i)
    if (cur==='{') {
      inBracket=true
    } else if (cur==='}') {
      inBracket=false
      const decodedVarName = decodeVarName(encodedVarName)
      out += '{' + decodedVarName  + '}'
      encodedVarName = ''
    }
    if (inBracket) {
      encodedVarName += cur
    } else {
      out += cur
    }
  }
  return out
}


locales.forEach(locale => {
  // If testing, we use English for all
  const srcFile = doTestMark ?
    `${__dirname}/../translation/crowdin/all-messages.json` :
    `${__dirname}/../translation/crowdin/all-messages_${locale}.json`
  const dstFile = `${__dirname}/../translations/${locale}.json`

  const fs = require('fs')
  const translations = {}

  let stringKeyValue=''
  try {
    stringKeyValue = JSON.parse(fs.readFileSync(srcFile))
  }
  catch (error) {
    console.warn(`Could not find or parse file: ${srcFile}`)
    return
  }
  console.log(`Processing file: ${srcFile}`)

  Object.keys(stringKeyValue).forEach(key => {
    const val = doTestMark ? '◀'+stringKeyValue[key]+'▶' : stringKeyValue[key]
    translations[key] = {
      'translations': [
        { 'translation': decode(val) }
      ]
    }
  })


  const file = {
    'fb-locale': locale,
    'translations': translations
  }

  const output = JSON.stringify(file, null, 2)

  // This should be writign to the fbt translations in ./translations
  fs.writeFileSync(dstFile, output)

  console.log(`✅ ${locale}`)

})
