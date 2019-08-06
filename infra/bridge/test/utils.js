'use strict'

const chai = require('chai')
const expect = chai.expect

const { decodeHTML } = require('../src/utils/index')

describe('helper functions', () => {
  it('should decode html content', async () => {
    let decoded = `Discounted Amazon gift cards with savings of up to 30%. Just one of the many cool things you can find on @OriginProtocol's #marketplace.`
    let encoded = `Discounted Amazon gift cards with savings of up to 30%. Just one of the many cool things you can find on @OriginProtocol&#x27;s #marketplace.`
    expect(decodeHTML(encoded)).to.equal(decoded)

    decoded = `Experience the decentralised global #marketplace of the future with @OriginProtocol's fresh new app. Secure transactions & Zero fees. Try it now: https://www.ogn.dev/mobile (shorten link)`
    encoded = `Experience the decentralised global #marketplace of the future with @OriginProtocol&#x27;s fresh new app. Secure transactions &amp; Zero fees. Try it now: https://www.ogn.dev/mobile (shorten link)`
    expect(decodeHTML(encoded)).to.equal(decoded)

    decoded = `Join @OriginProtocol's #rewards program and earn free Origin tokens! [x] OGN already distributed to thousands all around the world and we're still welcoming more to become token holders.`
    encoded = `Join @OriginProtocol&#x27;s #rewards program and earn free Origin tokens! [x] OGN already distributed to thousands all around the world and we&#x27;re still welcoming more to become token holders.`
    expect(decodeHTML(encoded)).to.equal(decoded)

    decoded = `Our meetup in #Venezuela was a significant step towards serving regions where crypto can provide improved financial access and freedom. Experience the power of decentralized commerce with @OriginProtocol's Marketplace app.`
    encoded = `Our meetup in #Venezuela was a significant step towards serving regions where crypto can provide improved financial access and freedom. Experience the power of decentralized commerce with @OriginProtocol&#x27;s Marketplace app.`
    expect(decodeHTML(encoded)).to.equal(decoded)

    decoded = `Batman >>>> Superman`
    encoded = `Batman &#x3E;&gt;&gt;&#x3E; Superman`
    expect(decodeHTML(encoded)).to.equal(decoded)

    decoded = `Superman <<<< Batman`
    encoded = `Superman &#x3C;&lt;&lt;&#x3C; Batman`
    expect(decodeHTML(encoded)).to.equal(decoded)

    decoded = `'This' 'is 'gonna "have 'a"" 'lot "of unwanted" 'single' and "double" quotes"`
    encoded = `&apos;This&apos; &apos;is &#x27;gonna &#x22;have &#x27;a&#x22;&#x22; &#x27;lot &quot;of unwanted&quot; &#x27;single&#x27; and &quot;double&#x22; quotes&#x22;`
    expect(decodeHTML(encoded)).to.equal(decoded)
  })
})
