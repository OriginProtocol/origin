const fs = require('fs');
const glob = require('glob')
const languageNames = require('../../src/utils/languageNames')
const translatedMessages = {}

glob.sync('./translations/languages/**/*.json')
  .map((filePath) => {

    const file = fs.readFileSync(filePath, 'utf8')
    const contents = JSON.parse(file)
    const languageName = filePath.substring( filePath.indexOf('/languages/') + 11, filePath.lastIndexOf('/') )
    const langNameObj = languageNames.filter((lang) => lang.name.toLowerCase() === languageName.toLowerCase())
    const langAbbrev = langNameObj[0] && langNameObj[0].code

    translatedMessages[langAbbrev] = contents

    console.info(`✔ ${languageName}`)
  })

fs.writeFileSync('./translations/translated-messages.json', JSON.stringify(translatedMessages, null, 2));

console.info('✔ Updated: /translations/translated-messages.json')
