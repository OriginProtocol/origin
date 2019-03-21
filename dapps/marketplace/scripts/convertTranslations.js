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
  Object.keys(langMsgs).forEach(msg => {
    if (msg.indexOf('schema') === 0) {
      const split = msg.split('.')
      if (split.length === 3) {
        const newSchema = `${split[0]}.${split[2]}`
        langMsgs[newSchema] = langMsgs[newSchema] || langMsgs[msg]
      }
    }
  })
  const translations = {}

  phrases.forEach(phrase => {
    const keys = Object.keys(phrase.hashToText)
    if (phrase.desc === 'category') {
      const reverseLookup = Object.keys(phrase.jsfbt.t).reduce((m, k) => {
        m[phrase.jsfbt.t[k]] = k
        return m
      }, {})

      keys.forEach(hash => {
        const value = phrase.hashToText[hash]
        translations[hash] = {
          translations: [{ translation: langMsgs[reverseLookup[value]] }]
        }
      })
      return
    }
    if (keys.length > 1) {
      console.error('Too many keys')
      return
    }
    if (!langMsgs[phrase.desc]) {
      console.error('Phrase not found')
      return
    }
    const hash = keys[0]
    translations[hash] = {
      translations: [{ translation: langMsgs[phrase.desc] }]
    }
  })

  const output = JSON.stringify({ 'fb-locale': lang, translations }, null, 2)
  fs.writeFileSync(`${__dirname}/../translations/${lang}.json`, output)
})
