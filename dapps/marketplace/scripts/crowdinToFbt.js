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
        { 'translation': val }
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
