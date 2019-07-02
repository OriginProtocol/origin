const fs = require('fs')

const locales = [
  'de_DE',
  'el_GR',
  'es_ES',
  'fil_PH',
  'fr_FR',
  'hr_HR',
  'id_ID',
  'it_IT',
  'ja_JP',
  'ko_KR',
  'nl_NL',
  'pt_PT',
  'ro_RO',
  'ru_RU',
  'th_TH',
  'tr_TR',
  'uk_UA',
  'vi_VN',
  'zh_CN',
  'zh_TW',
  'en_US'
]

function toBCP47(locale) {
  if (locale === 'zh_CN') return 'zh-Hans-CN'
  if (locale === 'zh_TW') return 'zh-Hant-TW'
  if (locale === 'pt_PT') return 'pt' // With shortened weekdays
  return locale.replace('_', '-')
}

locales.forEach(locale => {
  const bcp47 = toBCP47(locale)
  const srcPath = `${__dirname}/../../../node_modules/intl/locale-data/jsonp/${bcp47}.js`
  const dstPath = `${__dirname}/../public/locales/${locale}.json`
  console.log(locale)
  global.IntlPolyfill = {
    __addLocaleData: data => {
      const content = JSON.stringify(data)
      fs.writeFileSync(dstPath, content)
    }
  }
  require(srcPath)
})
