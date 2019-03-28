// Input: Source strings file from fbt, json in fbt format
// Output: Simple key-value json of strings, for consumption by crowdin

const srcFile = `${__dirname}/../.source_strings.json`
const dstFile = `${__dirname}/../translation/crowdin/all-messages.json`

const fs = require('fs')

const facebookTranslations = fs.readFileSync(srcFile)
const phrases = JSON.parse(facebookTranslations).phrases
const allMessages = {}

// To prevent machine translation from translating variables,
// convert spaces to underscores when in brackets.
function hideVars(str) {
  const bubbleAlphabet = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ'
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let out=''
  let inBracket = false
  for (var i = 0; i < str.length; i++) {
    const cur = str.charAt(i)
    if (cur==='{') {
      inBracket=true
      out+='{DO_NOT_TRANSLATE:'
      continue
    } else if (cur==='}') {
      inBracket=false
    }
    if (inBracket) {
      out += alphabet.indexOf(cur) < 0 ? cur : bubbleAlphabet.charAt(alphabet.indexOf(cur)) //cur==' ' ? '_' : cur
    } else {
      out += cur
    }
  }
  return out
}

phrases.forEach(phrase => {
  Object.keys(phrase.hashToText)
    .forEach(key => {
      allMessages[key] = hideVars(phrase.hashToText[key])
    })

})

const output = JSON.stringify(allMessages, null, 2)
fs.writeFileSync(dstFile, output)
