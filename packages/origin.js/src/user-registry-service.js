import UserRegistryContract from '../../contracts/build/contracts/UserRegistry.json'
import contract from 'truffle-contract'

class UserRegistryService {
    constructor() {
        this.userRegistryContract = contract(UserRegistryContract)
    }

    //Creates a new user with attestation or proof payload data and stores in user-registry in relation to wallet ID
    create(payload) {
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((error, accounts) => {
                let walletId = accounts[0];
                this.userRegistryContract.setProvider(window.web3.currentProvider);

                this.userRegistryContract.deployed().then((instance) => {
                    return instance.create_another.call(walletId, JSON.stringify(payload))
                }).then((response)  => {
                    console.log("user-registry-service found user:", response);
                resolve(response)
                }).catch((error) => {
                        console.log('user-registry-service could not find user:', walletId)
                    reject(error)
                })

            })
        })
    }


    //get user from from user-registry by their existing wallet ID
    get() {
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((error, accounts) => {

                let walletId = accounts[0];
                this.userRegistryContract.setProvider(window.web3.currentProvider);

                this.userRegistryContract.deployed().then((instance) => {
                    return instance.get.call(walletId)
                }).then((response)  => {
                    console.log("user-registry-service found user:", response);
                    resolve(response)
                }).catch((error) => {
                    console.log('user-registry-service could not find user:', walletId)
                    reject(error)
                })

            })
        })
    }
}

export default UserRegistryService