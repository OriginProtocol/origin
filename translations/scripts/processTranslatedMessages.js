const fs = require('fs');
const glob = require('glob')
const translatedMessages = {}

glob.sync('./translations/languages/**/*.json')
  .map((filePath) => {

    const file = fs.readFileSync(filePath, 'utf8')
    const contents = JSON.parse(file)
    const locale = filePath.substring( filePath.indexOf('/languages/') + 11, filePath.lastIndexOf('/') )

    if(locale && contents) {
      translatedMessages[locale] = contents
      console.info(`✔ ${locale}`)
    } else {
      console.info(`❌ Error processing translations for ${locale}`)
    }
    
  })

fs.writeFileSync('./translations/translated-messages.json', JSON.stringify(translatedMessages, null, 2));

console.info('✔ Updated: /translations/translated-messages.json')
