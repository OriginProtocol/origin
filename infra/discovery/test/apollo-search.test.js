const chai = require('chai')
const rewire = require('rewire')
const search = rewire('../src/lib/search.js')

const expect = chai.expect
chai.should()
chai.use(require('chai-things'))

const hiddenIds = ['999-000-1', '999-000-2']
const featuredIds = ['999-000-4', '999-000-2', '999-000-3']
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
    search.Listing.search('', [], 5, 0, false, hiddenIds, featuredIds)
    expect(lastQuery.body.from).to.equal(0)
    expect(lastQuery.body.size).to.equal(5)
    lastQuery.body.query.function_score.query.bool.must.should.include.something.that.deep.equals(
      { match_all: {} }
    )
  })

  it(`Should include hidden ids`, async () => {
    search.Listing.search('', [], 5, 0, false, hiddenIds, featuredIds)

    lastQuery.body.query.function_score.query.bool.must_not.should.include.something.that.deep.equals(
      { ids: { values: ['999-000-1', '999-000-2'] } }
    )
  })

  it(`Should include featured ids`, async () => {
    search.Listing.search('', [], 5, 0, false, hiddenIds, featuredIds)

    lastQuery.body.query.function_score.query.bool.should.should.include.something.that.deep.equals(
      { ids: { boost: 10000, values: ['999-000-4'] } }
    )
    lastQuery.body.query.function_score.query.bool.should.should.include.something.that.deep.equals(
      { ids: { boost: 9900, values: ['999-000-2'] } }
    )
    lastQuery.body.query.function_score.query.bool.should.should.include.something.that.deep.equals(
      { ids: { boost: 9800, values: ['999-000-3'] } }
    )
  })

  it(`Should include queried text with fuzzy query`, async () => {
    search.Listing.search(
      'Taylor Swift',
      [],
      5,
      0,
      false,
      hiddenIds,
      featuredIds
    )

    lastQuery.body.query.function_score.query.bool.must.should.include.something.that.deep.equals(
      { match: { all_text: { fuzziness: 'AUTO', query: 'Taylor Swift' } } }
    )
  })

  it(`Should include boost for match in the title`, async () => {
    search.Listing.search(
      'Taylor Swift',
      [],
      5,
      0,
      false,
      hiddenIds,
      featuredIds
    )

    lastQuery.body.query.function_score.query.bool.should.should.include.something.that.deep.equals(
      {
        match: { title: { boost: 2, fuzziness: 'AUTO', query: 'Taylor Swift' } }
      }
    )
  })

  it(`Should include boost for match in the title`, async () => {
    search.Listing.search(
      'Taylor Swift',
      [],
      5,
      0,
      false,
      hiddenIds,
      featuredIds
    )

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
    search.Listing.search(
      'Taylor Swift',
      filters,
      5,
      0,
      false,
      hiddenIds,
      featuredIds
    )

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
    search.Listing.search(
      'Taylor Swift',
      filters,
      5,
      0,
      false,
      hiddenIds,
      featuredIds
    )

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
    search.Listing.search(
      'Taylor Swift',
      filters,
      5,
      0,
      false,
      hiddenIds,
      featuredIds
    )

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
    search.Listing.search(
      'Taylor Swift',
      filters,
      5,
      0,
      false,
      hiddenIds,
      featuredIds
    )

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
})
