const fs = require('fs')

const convert = 'de_DE el_GR es_ES fil_PH fr_FR hr_HR id_ID it_IT ja_JP ko_KR nl_NL pt_PT ro_RO ru_RU th_TH tr_TR uk_UA vi_VN zh_CN zh_TW'.split(
  ' '
)

const rawStrings = fs.readFileSync(`${__dirname}/../.source_strings.json`)
const phrases = JSON.parse(rawStrings).phrases
const oldFiles = `${__dirname}/../../../origin-dapp/translations/languages/`

convert.forEach(lang => {
  const rawLang = fs.readFileSync(
    `${oldFiles}${lang.replace('_', '-')}/all-messages.json`
  )
  const langMsgs = JSON.parse(rawLang)
  const translations = {}

  phrases.forEach(phrase => {
    const keys = Object.keys(phrase.hashToText)
    if (keys.length > 1) {
      console.log('Too many keys')
      return
    }
    if (!langMsgs[phrase.desc]) {
      console.log('Phrase not found')
      return
    }
    const hash = keys[0]
    translations[hash] = {
      translations: [{ translation: langMsgs[phrase.desc] }]
    }
  })

  const output = JSON.stringify({ 'fb-locale': lang, translations }, null, 4)
  fs.writeFileSync(`${__dirname}/../translations/${lang}.json`, output)
})
