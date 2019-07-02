export function toBCP47(locale) {
  if (locale === 'zh_CN') return 'zh-Hans-CN'
  if (locale === 'zh_TW') return 'zh-Hant-TW'
  if (locale === 'pt_PT') return 'pt' // With shortened weekdays
  return locale.replace('_', '-')
}

export default [
  ['de_DE', 'Deutsch'],
  ['el_GR', 'ελληνικά'],
  ['es_ES', 'Español'],
  ['fil_PH', 'Filipino'],
  ['fr_FR', 'Français'],
  ['hr_HR', 'hrvatski jezik'],
  ['id_ID', 'Indonesian'],
  ['it_IT', 'Italiano'],
  ['ja_JP', '日本語'],
  ['ko_KR', '한국어'],
  ['nl_NL', 'Nederlands'],
  ['pt_PT', 'Português'],
  ['ro_RO', 'limba română'],
  ['ru_RU', 'Русский'],
  ['th_TH', 'ไทย'],
  ['tr_TR', 'Türkçe'],
  ['uk_UA', 'Українська'],
  ['vi_VN', 'Tiếng Việt'],
  ['zh_CN', '简体中文'],
  ['zh_TW', '繁體中文'],
  ['en_US', 'English']
]
