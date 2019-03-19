const fs = require('fs')
const logger = require('../logger')

const sdnCsvFilename = `${__dirname}/../../data/sdn.csv`

class CsvLineParser {
  constructor() {
    this.reValid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
    this.reValue = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g
  }

  /**
   * Parses a csv line and returns an array.
   *
   * @param line
   * @returns {Array<string>}
   */
  parse(line) {
    // Return NULL if input string is not well formed CSV string.
    if (!this.reValid.test(line)) return null
    // Initialize array to receive values.
    const a = []
    // Walk the string using replace with callback.
    line.replace(this.reValue, function(m0, m1, m2, m3) {
      // Remove backslash from \' in single quoted values.
      if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"))
      // Remove backslash from \" in double quoted values.
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'))
      else if (m3 !== undefined) a.push(m3)
      return ''
    })
    // Handle special case of empty last value.
    if (/,\s*$/.test(line)) a.push('')
    return a
  }
}

class SdnMatcher {
  constructor() {
    this.lastNames = {} // Maps lastname -> Array<firstName>
    this._parseData(new CsvLineParser())
  }

  /**
   * Reads the CDN csv files and populates the lastNames structure.
   * @private
   */
  _parseData(lineParser) {
    const data = fs.readFileSync(sdnCsvFilename).toString()
    const lines = data.split('\r\n')
    for (const line of lines) {
      const cells = lineParser.parse(line)
      if (!cells || cells.length < 2) {
        continue
      }
      if (cells[2] !== 'individual') {
        continue
      }
      const values = cells[1].split(',').map(s => s.toLowerCase().trim())
      const firstName = values[0]
      const lastName = values[1]
      if (!firstName || !lastName) {
        continue
      }

      if (this.lastNames[lastName]) {
        this.lastNames[lastName].push(firstName)
      } else {
        this.lastNames[lastName] = [firstName]
      }
    }
    logger.info(
      `Read ${Object.keys(this.lastNames).length} records from SDN list.`
    )
  }

  /**
   * Returns true if the first+last name match an individual in the SDN list.
   *
   * @param matcher
   * @param firstName
   * @param lastName
   * @returns {boolean}
   */
  match(firstName, lastName) {
    // Normalize the input.
    const normFirstName = firstName.trim().toLowerCase()
    const normLastName = lastName.trim().toLowerCase()

    // Check against records of lastNames/firstNames.
    const firstNames = this.lastNames[normLastName]
    if (!firstNames) {
      return false
    }
    return firstNames.includes(normFirstName)
  }
}

module.exports = { SdnMatcher }
