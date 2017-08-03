class IpfsService {

  static instance;

  constructor() {
    if (IpfsService.instance) {
      return IpfsService.instance;
    }

    IpfsService.instance = this;
  }

  submitListing(listing) {
    console.log("Submit data to IPFS and return an ipfs object here");
    console.log(listing);

    // Stub promise
    const promise = new Promise((resolve, reject) => {
      const ipfsListing = {
        'foo': 'bar',
        'blah': 'blah'
      };

      if (ipfsListing) {
        resolve(ipfsListing);
      } else {
        reject('Some failure thing');
      }
    });

    return promise;
  }
}

let ipfsService = new IpfsService();

export default ipfsService;