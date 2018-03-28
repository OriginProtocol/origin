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

})