const fs = require('fs')

const facebookTranslations = fs.readFileSync(`${__dirname}/../.source_strings.json`)
const phrases = JSON.parse(facebookTranslations).phrases
const allMessages = {}

phrases.forEach(phrase => {
	Object.keys(phrase.hashToText)
		.forEach(key => {
			allMessages[key] = phrase.hashToText[key]
		})

})

const output = JSON.stringify(allMessages, null, 2)
fs.writeFileSync(`${__dirname}/../translations/all-messages.json`, output)
