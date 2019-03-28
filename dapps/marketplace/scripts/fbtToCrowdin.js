// Input: Source strings file from fbt, json in fbt format
// Output: Simple key-value json of strings, for consumption by crowdin

const srcFile = `${__dirname}/../.source_strings.json`
const dstFile = `${__dirname}/../translation/crowdin/all-messages.json`

const fs = require('fs')

const facebookTranslations = fs.readFileSync(srcFile)
const phrases = JSON.parse(facebookTranslations).phrases
const allMessages = {}

// To prevent machine translation from translating variables,
// we encode them into an untranslatable string composed of several parts:
//  - Optional "E_" if the argument has a "=" prefix.
//  - DO_NOT_TRANSLATE__ prefix
//  - Variable name, with all letters in upper case and spaces replaced with "_".
//    The variable name is to help giving extra context to the translators.
//  - Base64 encoded version of the original variable name, with no "=" padding at the end.
//    This is to be able to use the original name for converting language
//    files exported by crowdin back to fbt format. Prefixed by "_B64_".
//
// For example, the variable {=Apple and banana} gets converted into
// {E_DO_NOT_TRANSLATE_APPLE_AND_BANANA_B64_QXBwbGUgYW5kIGJhbmFuYQ}
//
// For the decoding counterpart of this method, see crowdinToFbt.js
//
const EqualPrefix = 'E_'
const DoNotTranslatePrefix = 'DO_NOT_TRANSLATE_'
const b64Prefix = '_B64_'

function encodeVarName(varName) {
  let name = varName

  let prefix = ''
  if (varName.startsWith('=')) {
    prefix = EqualPrefix
    name = name.slice(1)
  }

  // Convert variable name into all upper case with spaces replaced by underscores.
  const upper = name.toUpperCase().replace(/\ /g, '_')

  // Base 64 encode the variable name. Remove any extra = paddings.
  const b64 = new Buffer.from(name).toString('base64').replace(/\=/g, '')

  return prefix + DoNotTranslatePrefix + upper + b64Prefix + b64
}

function encode(str) {
  let out = ''
  let varName = ''
  let inBracket = false
  for (let i = 0; i < str.length; i++) {
    const cur = str.charAt(i)
    if (cur === '{') {
      inBracket=true
      continue
    } else if (cur === '}') {
      inBracket=false
      const encodedVarName = encodeVarName(varName)
      out += '{' + encodedVarName + '}'
      varName = ''
      continue
    }
    if (inBracket) {
      varName += cur
    } else {
      out += cur
    }
  }
  console.log("Encoded ", str, " into ", out)
  return out
}

phrases.forEach(phrase => {
  Object.keys(phrase.hashToText)
    .forEach(key => {
      allMessages[key] = encode(phrase.hashToText[key])
    })

})

const output = JSON.stringify(allMessages, null, 2)
fs.writeFileSync(dstFile, output)
