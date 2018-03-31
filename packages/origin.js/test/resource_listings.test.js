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
    const ids = await origin.listings.allIds();
    expect(ids.length).to.be.greaterThan(4);
  });

  it("should get a listing", async () => {
    const listing = await origin.listings.getByIndex(testListingIds[0]);
    expect(listing.name).to.equal("Zinc House");
    expect(listing.index).to.equal(testListingIds[0]);
  });

  it("should buy a listing", async () => {
    const listing = await origin.listings.getByIndex(testListingIds[0]);
    const transaction = await origin.listings.buy(
      listing.address,
      1,
      listing.price * 1
    );
    //Todo: Currently this test will fail here with a timeout
    //  because we need to somehow get web3 approve this transaction
    // Todo: wait for transaction, then check that purchase was created.
  }).timeout(5000);

  it("should create a listing", async () => {
    const listingData = {
      name: "1972 Geo Metro 255K",
      category: "Cars & Trucks",
      location: "New York City",
      description:
        "The American auto-show highlight reel will be disproportionately concentrated on the happenings in New York.",
      pictures: undefined,
      price: 3.3
    };
    const schema = "for-sale";
    await origin.listings.create(listingData, schema);
    // Todo: Check that this worked after we have web3 approvals working
  });
});
