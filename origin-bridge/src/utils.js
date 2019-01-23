const web3 = require('web3')

// 128 words to map character codes to words
const words = ["surprise", "now", "mimic", "hood", "say", "glance", "there",
  "lava", "mimic", "crouch", "utility", "sorry", "address", "marine",
  "century", "wing", "farm", "citizen", "alone", "dentist", "knee", "bracket",
  "measure", "faith", "shine", "disagree", "hood", "slot", "spirit",
  "announce", "truly", "process", "response", "guard", "two", "connect",
  "assist", "ordinary", "raise", "muscle", "mistake", "festival", "mix",
  "flock", "puzzle", "ill", "border", "spy", "ozone", "uphold", "trumpet",
  "figure", "borrow", "topple", "wedding", "february", "above", "ordinary",
  "term", "nerve", "sure", "else", "hope", "submit", "ghost", "scatter",
  "limit", "above", "jewel", "bundle", "tail", "reform", "drama", "model",
  "stove", "bachelor", "kitchen", "combine", "swing", "trust", "mad",
  "segment", "affair", "forest", "grocery", "album", "subway", "concert",
  "aware", "bullet", "nominee", "juice", "oak", "sand", "toast", "celery",
  "noble", "giraffe", "bitter", "across", "federal", "clean", "catalog",
  "citizen", "street", "husband", "prefer", "term", "fun", "ranch", "entry",
  "install", "appear", "purse", "virtual", "improve", "sea", "ghost", "grant",
  "rule", "engage", "vicious", "struggle", "century", "nephew", "try",
  "vehicle", "crystal"
]

function generateAirbnbCode(ethAddress, userId) {
  const hashCode = web3.utils.sha3(ethAddress + userId).substr(-7)
  console.log(hashCode)
  return Array.prototype.map
    .call(hashCode, (i) => words[i.charCodeAt(0)])
    .join(' ')
}

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000)
}

function getAbsoluteUrl(relativeUrl) {
  protocol = process.env.HTTPS ? 'https' : 'http'
  return protocol + '://' + process.env.HOST + relativeUrl
}

function mapObjectToQueryParams(obj) {
  return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

module.exports = { generateAirbnbCode, generateSixDigitCode, getAbsoluteUrl, mapObjectToQueryParams }
