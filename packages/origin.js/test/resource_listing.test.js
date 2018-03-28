import { expect } from 'chai'
import Origin from '../src/index.js'

describe("Listing Resource", () => {
    var origin
    var testListingIds

    before( async () => {
        origin = Origin // Doing this little dance because eventualy Origin won't be a singleton, but something we instantiate
        testListingIds = await origin.contractService.getAllListingIds()
    })

    it("should get a listing", async () => {
        const listing = await origin.resources.listing.get(testListingIds[0])
        expect(listing.name).to.equal("Zinc House")
        expect(listing.index).to.equal(testListingIds[0])
    })

    it("should buy a listing", async () => {
        const listing = await origin.resources.listing.get(testListingIds[0])
        const transaction = await origin.resources.listing.buy(listing.address, 1, listing.price * 1)
        //Todo: Currently this test will fail here with a timeout
        //  because we need to somehow get web3 approve this transaction
        // Todo: wait for transaction, then check that purchase was created.
    }).timeout(5000)

})