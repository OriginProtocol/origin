/*
 Script to import users and grants data into the T3 database.
 Input is a csv file. It is advised to run the script in dry-run mode first
 in order to validate the input data before loading it in the database.

 Usage:
   node import_data.js --filename=<filename>

 Example 1: Validate the data.
   node import_data.js --filename=investors.csv

 Example 2: Import the data in the DB.
   node import_data.js --filename=investors.csv --doIt=true
 */

const assert = require('assert')
const fs = require('fs')
const Logger = require('logplease')

const db = require('../models')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('import_data', { showTimestamp: false })

const employeesVestingInterval = 'months'

const purchaseRounds = ['Advisor', 'Strategic', 'Coinlist']

// TODO(franck): Update those values based on final investors vesting schedule.
const investorsVestingStart = new Date('2020/01/01')
const investorsVestingEnd = new Date('2020/12/31')
const investorsVestingCliff = new Date('2020/04/01')
const investorsVestingInterval = 'days'

class CsvFileParser {
  constructor(filename, employee) {
    this.filename = filename
    this.employee = employee
    this.numCols = 6
  }

  _parseLine(line) {
    const validCsvLineRegex = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
    const csvValueRegex = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g

    // Return null if the input string is not a well formed CSV string.
    if (!validCsvLineRegex.test(line)) {
      return null
    }

    const a = []
    // Walk the string using replace with callback.
    line.replace(csvValueRegex, function(m0, m1, m2, m3) {
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

  _checkHeader(header) {
    assert(header[0] === 'Name')
    assert(header[1] === 'Email')
    assert(header[2] === 'OGN Amount')
    if (this.employee) {
      assert(header[3] === 'Vesting Start')
      assert(header[4] === 'Vesting End')
      assert(header[5] === 'Vesting Cliff')
      assert(header[6] === 'Vesting Interval')
    } else {
      assert(header[3] === 'Purchase Date')
      assert(header[4] === 'Purchase Round')
      assert(header[5] === 'Investment Amount')
    }
  }

  parse() {
    const emailRegex = /^[a-z0-9-._+]+@[a-z0-9-]+(\.[a-z]+)*(\.[a-z]{2,})$/i
    const dollarAmountRegex = /^\$[0-9,]+(\.[0-9][0-9])?$/

    const data = fs.readFileSync(this.filename).toString()
    const lines = data.split('\r\n')

    // Validate the header.
    let lineNumber = 1
    const header = this._parseLine(lines[0])
    this._checkHeader(header)

    // Read records.
    const records = []
    for (const line of lines.slice(1)) {
      lineNumber++
      logger.debug(`Parsing line ${lineNumber}: |${line}|`)
      if (!line || line.length === 0) {
        continue
      }
      const cells = this._parseLine(line)
      if (!cells || cells.length !== this.numCols) {
        logger.error(`Invalid line #${lineNumber}: |${line}|`)
        throw new Error('Invalid data')
      }

      const record = {}

      // Parse common fields for both employees and investors
      const name = cells[0].trim()
      assert(name.length > 0)
      record.name = name

      const email = cells[1].trim()
      assert(email.length > 0)
      assert(emailRegex.test(email))
      record.email = email

      const amount = Number(cells[2].trim().replace(/,/g, ''))
      assert(!Number.isNaN(amount))
      record.amount = amount

      if (this.employee) {
        // Parse employee specific fields
        const vestingStart = new Date(cells[3])
        assert(vestingStart instanceof Date)
        record.start = vestingStart

        const vestingEnd = new Date(cells[4])
        assert(vestingEnd instanceof Date)
        assert(vestingEnd > vestingStart)
        record.end = vestingEnd

        const vestingCliff = new Date(cells[5])
        assert(vestingCliff instanceof Date)
        assert(vestingCliff > vestingStart)
        assert(vestingCliff < vestingEnd)
        record.cliff = vestingCliff

        record.interval = employeesVestingInterval
      } else {
        // Parse investor specific fields
        const purchaseDate = new Date(cells[3])
        assert(purchaseDate instanceof Date)
        record.purchaseDate = purchaseDate

        // TODO(franck): this DB field may get renamed.
        const purchaseRound = cells[4].trim()
        assert(purchaseRounds.includes(purchaseRound))
        record.purchaseRound = purchaseRound

        // We expect amounts to be formatted as $X.Y
        // For example $123,457.789
        let investmentAmount = cells[5].trim()
        assert(dollarAmountRegex.test(investmentAmount))
        investmentAmount = Number(investmentAmount.replace(/[$,]/g, ''))
        assert(!Number.isNaN(investmentAmount))
        record.investmentAmount = investmentAmount

        // Those fields are constant for all investors.
        record.start = investorsVestingStart
        record.end = investorsVestingEnd
        record.cliff = investorsVestingCliff
        record.interval = investorsVestingInterval
      }

      records.push(record)
    }
    logger.info(`Read ${records.length} records from ${this.filename}.`)
    return records
  }
}

class ImportData {
  constructor(config) {
    this.config = config
    this.stats = {
      numUserRowsInserted: 0,
      numGrantRowsInserted: 0
    }
  }

  async process() {
    const parser = new CsvFileParser(this.config.filename, this.config.employee)
    const records = parser.parse()

    for (const record of records) {
      // Check if user already exists, otherwise create a new user.
      let user
      user = await db.User.findOne({ where: { email: record.email } })
      if (!user) {
        if (this.config.doIt) {
          user = await db.User.create({
            name: record.name,
            email: record.email,
            employee: this.config.employee
          })
        }
        this.stats.numUserRowsInserted++
      }
      if (this.config.doIt) {
        await db.Grant.create({
          userId: user.id,
          start: record.start,
          end: record.end,
          cliff: record.cliff,
          // Note: Some investors were granted a decimal amount of OGN.
          // We round it up to an integer amount.
          amount: Math.ceil(record.amount),
          interval: record.interval,
          purchaseDate: record.purchaseDate,
          purchaseRound: record.purchaseRound,
          investmentAmount: record.investmentAmount
        })
      }
      this.stats.numGrantRowsInserted++
    }
  }
}

function parseArgv() {
  const args = {}
  for (const arg of process.argv) {
    const elems = arg.split('=')
    const key = elems[0]
    const val = elems.length > 1 ? elems[1] : true
    args[key] = val
  }
  return args
}

/**
 * MAIN
 */
logger.info('Starting script to import data into T3 DB.')

const args = parseArgv()
const config = {
  filename: args['--filename'],
  // Investor by default.
  employee: args['--employee'] === 'true' || false,
  // Run in in dry-run mode by default.
  doIt: args['--doIt'] === 'true' || false
}
logger.info('Config:')
logger.info(config)

if (!config.filename) {
  throw new Error('--filename arg missing')
}

const job = new ImportData(config)

job
  .process()
  .then(() => {
    logger.info('================================')
    logger.info('Job stats:')
    logger.info('  Number users inserted:  ', job.stats.numUserRowsInserted)
    logger.info('  Number grants inserted: ', job.stats.numGrantRowsInserted)
    logger.info('Finished')
    process.exit()
  })
  .catch(err => {
    logger.error('Job failed: ', err)
    logger.error('Exiting')
    process.exit(-1)
  })
