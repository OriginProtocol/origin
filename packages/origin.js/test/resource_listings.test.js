import { expect } from "chai";
import Origin from "../src/index.js";

describe("Listing Resource", () => {
  var origin;
  var testListingIds;

  before(async () => {
    origin = Origin; // Doing this little dance because eventualy Origin won't be a singleton, but something we instantiate
    testListingIds = await origin.contractService.getAllListingIds();
  });

  it("should get all listing ids", async () => {
    console.log("b");
    const ids = await origin.resources.listings.allIds();
    console.log("a");
    expect(ids.length).to.equal(5);
  });

  it("should get a listing", async () => {
    const listing = await origin.resources.listings.getByIndex(testListingIds[0]);
    expect(listing.name).to.equal("Zinc House");
    expect(listing.index).to.equal(testListingIds[0]);
  });

  it("should buy a listing", async () => {
    const listing = await origin.resources.listings.getByIndex(testListingIds[0]);
    const transaction = await origin.resources.listings.buy(
      listing.address,
      1,
      listing.price * 1
    );
    //Todo: Currently this test will fail here with a timeout
    //  because we need to somehow get web3 approve this transaction
    // Todo: wait for transaction, then check that purchase was created.
  }).timeout(5000);
});
