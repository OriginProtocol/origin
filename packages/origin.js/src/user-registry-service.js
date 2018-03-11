import UserRegistryContract from '../../contracts/build/contracts/UserRegistry.json'

class UserRegistryService {
    static instance

    constructor() {

        if (UserRegistryService.instance) {
            return UserRegistryService.instance
        }

        UserRegistryService.instance = this;

        this.contract = require('truffle-contract')
        this.userRegistryContract = this.contract(UserRegistryContract)

        console.log(this.userRegistryContract);
    }


    civic(jwt) {
        return new Promise((resolve, reject) => {
            this.userRegistryContract.setProvider(window.web3.currentProvider);
            this.userRegistryContract.deployed().then((instance) => {
                return instance.civic.call(jwt)
            })
            .then((response)  => {
                console.log("user-registry-service sees:", response);
                resolve(response)
            })
            .catch((error) => {
                console.log('Error logging in:')
                reject(error)
            })
        })
    }


}

const userRegistryService = new UserRegistryService()

export default userRegistryService


