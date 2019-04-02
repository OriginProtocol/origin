// Input: Source strings file from fbt, json in fbt format
// Output: Simple key-value json of strings, for consumption by Crowdin

const srcFile = `${__dirname}/../.source_strings.json`
const dstFile = `${__dirname}/../translation/crowdin/all-messages.json`

const fs = require('fs')

const facebookTranslations = fs.readFileSync(srcFile)
const phrases = JSON.parse(facebookTranslations).phrases
const allMessages = {}

// To prevent machine translation from translating variables,
// we encode them into an untranslatable string composed of several parts:
//  - Optional "E_" if the argument has a "=" prefix.
//  - VAR_ prefix
//  - Variable name, with all letters in upper case and spaces replaced with "_".
//    The variable name is to help giving extra context to the translators.
//  - Base64 encoded version of the original variable name, with no "=" padding at the end.
//    This is to be able to use the original name for converting language
//    files exported by crowdin back to fbt format. Prefixed by "_B64_".
//
// For example, the variable {=Apple and banana} gets converted into
// {E_VAR_APPLE_AND_BANANA_B64_QXBwbGUgYW5kIGJhbmFuYQ}
//
// For the decoding counterpart of this method, see crowdinToFbt.js

const EqualPrefix = 'E_'
const VarPrefix = 'VAR_'
const b64Prefix = '_B64_'

function b64Encode(str) {
  return new Buffer.from(str).toString('base64')
    .replace(/=/g, '')       // Strip base64 padding. It is not essential.
    .replace(/\//g, 'SLASH')  // Replace '/' since otherwise MT alters the string.
    .replace(/\+/g, 'PLUS')   // Replace '+' since otherwise MT alters the string.
}

function encodeVarName(varName) {
  let name = varName

  let prefix = ''
  if (varName.startsWith('=')) {
    prefix = EqualPrefix
    name = name.slice(1)
  }

  const sanitizedName = name
    .replace(/ /g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, '') // Strip any non alphabet character
    .toUpperCase() // Convert to upper case.

  // Base 64 encode the original variable name and sanitize it
  // so that MT does not try to alter it.
  const b64Name = b64Encode(name)

  return prefix + VarPrefix + sanitizedName + b64Prefix + b64Name
}

function encode(str) {
  // Special case for strings that are just a concatenation of variables.
  // For ex.: "{=var1}{=var2}...{=var3}"
  // This happens when a blob of html is wrapped into a fbt tag, such as:
  // </fbt desc="blob">
  //   This is
  //   <b> a huge</b>
  //   blob
  // </fbt>
  // In that case we base64 encode the whole string.
  if (str.startsWith('{=') && str.endsWith('}')) {
    const b64 = b64Encode(str.slice(1, str.length-1))
    return '{' + VarPrefix + b64 + '}'
  }

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
