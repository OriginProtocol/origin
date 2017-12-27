import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'

class OriginService {
  static instance

  submitListing(formListing, selectedSchemaType) {

    return new Promise((resolve, reject) => {

      const jsonBlob = {
        'schema': `http://localhost:3000/schemas/${selectedSchemaType.type}.json`,
        'data': formListing.formData,
        'signed_by': 'https://keybase.io/joshfraser',
        'signature': `-----BEGIN PGP SIGNATURE-----
  Version: Keybase OpenPGP v2.0.73
  Comment: https://keybase.io/crypto

  wsBcBAABCgAGBQJZlhmAAAoJEKTjGE37cmbxy38IALSQxXAE4wVc8d4rP0v8TaBE
  MolxVoyev2MXUz0wdclXS2mmKMSVObiFOqjrCxqBTvzQRYbquuSQUTzO4t/C1WPp
  AEodUf7KSBH7fGnuYVixIRvrvtF2MMGlFm/U1MpY1CtY5G+UYhzdoLWvOGf5b1yw
  BiTAwczR7KqtFOYYdmNuIIqsUvLlV6fQjCihItIgc2521iZYxNUBSBjhINEtCUvV
  L6tE1lR1dMcKOa7JMTqQsbGloiD5t2IsEdzxbzgWlheTjcqoN6id+QzPC1DK9mjX
  b7Qf9nchgZZhJdOBSoSRqf47nxdUx1bqY1DIR+hOyF+p6j2nYVMcDD5Z3uB/tns=
  =A9r6
  -----END PGP SIGNATURE-----`
      }

    	// Submit to IPFS
      ipfsService.submitListing(jsonBlob)
      .then((ipfsHash) => {
        console.log(`IPFS file created with hash: ${ipfsHash} for data:`)
        console.log(jsonBlob)

        // TODO: Validate that ipfsHash is valid

  	  	// Submit to ETH contract
        let units = 1; // TODO: Allow users to set number of units in form
  	    contractService.submitListing(ipfsHash, formListing.formData.price, units)
  	    .then((transactionReceipt) => {
          // Success!
  	    	console.log(`On ETH blockchain with transactionReceipt: ${transactionReceipt.tx}`)
          resolve(transactionReceipt.tx)
  	    })
  	    .catch((error) => {
  	      console.error(error)
          reject(`ETH Failure: ${error}`)
  	    });
      })
      .catch((error) => {
        reject(`IPFS Failure: ${error}`)
      });

    });
  }



}

const originService = new OriginService()

export default originService
