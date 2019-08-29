const chai = require('chai')
const rewire = require('rewire')
const search = rewire('../src/lib/search.js')

const expect = chai.expect
chai.should()
chai.use(require('chai-things'))

let lastQuery

describe('Search', () => {
  before(function() {
    // get private variable using rewire
    const client = search.__get__('client')
    // change behaviour of elasticsearch's search function to store the generated query
    client.search = function(query) {
      // do not cache aggregation query

      if (query.body.aggs === undefined) {
        lastQuery = query
      }

      return new Promise(resolve => {
        resolve({
          hits: {
            hits: [],
            total: 0
          },
          aggregations: {
            max_price: {
              value: 0
            },
            min_price: {
              value: 0
            }
          }
        })
      })
    }
  })

  beforeEach(function() {
    lastQuery = null
  })

  it(`Should generate a query for all listings`, async () => {
    await search.Listing.search('', '', '', [], 5, 0)
    expect(lastQuery.body.from).to.equal(0)
    expect(lastQuery.body.size).to.equal(5)
    lastQuery.body.query.function_score.query.bool.must.should.include.something.that.deep.equals(
      { match_all: {} }
    )
  })

  it(`Should include queried text with fuzzy query`, async () => {
    await search.Listing.search('Taylor Swift', '', '', [], 5, 0)

    lastQuery.body.query.function_score.query.bool.must.should.include.something.that.deep.equals(
      {
        match: {
          all_text: {
            fuzziness: 'AUTO',
            minimum_should_match: '-20%',
            query: 'Taylor Swift'
          }
        }
      }
    )
  })

  it(`Should include boost for match in the title`, async () => {
    await search.Listing.search('Taylor Swift', '', '', [], 5, 0)

    lastQuery.body.query.function_score.query.bool.should.should.include.something.that.deep.equals(
      {
        match: { title: { boost: 2, fuzziness: 'AUTO', query: 'Taylor Swift' } }
      }
    )
  })

  it(`Should include boost for match in the title`, async () => {
    await search.Listing.search('Taylor Swift', '', '', [], 5, 0)

    lastQuery.body.query.function_score.query.bool.should.should.include.something.that.deep.equals(
      {
        match: { title: { boost: 2, fuzziness: 'AUTO', query: 'Taylor Swift' } }
      }
    )
  })

  it(`Should create greater or equal query`, async () => {
    const filters = [
      {
        operator: 'GREATER_OR_EQUAL',
        name: 'price',
        value: 20
      }
    ]
    await search.Listing.search('Taylor Swift', '', '', filters, 5, 0)

    lastQuery.body.query.function_score.query.bool.filter.should.include.something.that.deep.equals(
      { range: { price: { gte: 20 } } }
    )
  })

  it(`Should create lesser or equal query`, async () => {
    const filters = [
      {
        operator: 'LESSER_OR_EQUAL',
        name: 'price',
        value: 20
      }
    ]
    await search.Listing.search('Taylor Swift', '', '', filters, 5, 0)

    lastQuery.body.query.function_score.query.bool.filter.should.include.something.that.deep.equals(
      { range: { price: { lte: 20 } } }
    )
  })

  it(`Should create equals query`, async () => {
    const filters = [
      {
        operator: 'EQUALS',
        name: 'category',
        value: 'cars'
      }
    ]
    await search.Listing.search('Taylor Swift', '', '', filters, 5, 0)

    lastQuery.body.query.function_score.query.bool.filter.should.include.something.that.deep.equals(
      { term: { category: 'cars' } }
    )
  })

  it(`Should create contains query`, async () => {
    const filters = [
      {
        operator: 'CONTAINS',
        name: 'category',
        value: 'cars,housing',
        valueType: 'ARRAY_STRING'
      }
    ]
    await search.Listing.search('Taylor Swift', '', '', filters, 5, 0)

    lastQuery.body.query.function_score.query.bool.filter.should.include.something.that.deep.equals(
      {
        bool: {
          should: [
            {
              term: {
                category: 'cars'
              }
            },
            {
              term: {
                category: 'housing'
              }
            }
          ]
        }
      }
    )
  })

  it(`Should create empty sort query i.e. disable skip sorting`, async () => {
    await search.Listing.search('', '', '', [], 5, 0)
    lastQuery.body.sort.should.deep.equals([])
  })

  it(`Should create sort by price.amount query with asc order`, async () => {
    await search.Listing.search('', 'price.amount', 'asc', [], 5, 0)
    // not using deep equal because excluding _script.script.params as that that could
    // change depending on the currency exchange rates needed
    lastQuery.body.sort._script.order.should.equal('asc')
    lastQuery.body.sort._script.type.should.equal('number')
    lastQuery.body.sort._script.script.lang.should.equal('painless')
    lastQuery.body.sort._script.script.source.should.be.a('string')
  })

  it(`Should throw error and disable sorting if sort variables are not whitelisted`, async () => {
    // would be great to verify actual error is thrown as well
    // for now just ensuring sort is disabled
    await search.Listing.search('', 'foo', 'bar', [], 5, 0)
    lastQuery.body.sort.should.deep.equals([])
  })
})
