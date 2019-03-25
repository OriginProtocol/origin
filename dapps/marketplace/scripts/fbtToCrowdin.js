// Input: Source strings file from fbt, json in fbt format
// Output: Simple key-value json of strings, for consumption by crowdin

const srcFile = `${__dirname}/../.source_strings.json`
const dstFile = `${__dirname}/../translation/crowdin/all-messages.json`

const fs = require('fs')

const facebookTranslations = fs.readFileSync(srcFile)
const phrases = JSON.parse(facebookTranslations).phrases
const allMessages = {}

phrases.forEach(phrase => {
  Object.keys(phrase.hashToText)
    .forEach(key => {
      allMessages[key] = phrase.hashToText[key]
    })

})

const output = JSON.stringify(allMessages, null, 2)
fs.writeFileSync(dstFile, output)
