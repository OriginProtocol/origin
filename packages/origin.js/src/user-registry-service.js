import UserRegistryContract from '../../contracts/build/contracts/UserRegistry.json'
import promisify from 'util.promisify'

class UserRegistryService {
    static instance

    constructor() {

        if (UserRegistryService.instance) {
            return UserRegistryService.instance
        }

        UserRegistryService.instance = this;

        this.contract = require('truffle-contract')
        this.userRegistryContract = this.contract(UserRegistryContract)
    }


    //Creates a new user with attestation or proof payload data and stores in user-registry in relation to wallet ID
    async create(payload) {
        const { currentProvider, eth } = window.web3;
        const accounts = await promisify(eth.getAccounts.bind(eth))()

        const walletId = accounts[0];
        this.userRegistryContract.setProvider(currentProvider);

        let instance
        try {
            instance = await this.userRegistryContract.deployed()
        } catch (error) {
            console.log('user-registry-service could not find user:', walletId)
            throw error
        }

        const response = instance.create_another.call(walletId, JSON.stringify(payload))
        console.log("user-registry-service found user:", response);
        return response
    }


    //get user from from user-registry by their existing wallet ID
    async get() {
        const { currentProvider, eth } = window.web3;
        const accounts = await promisify(eth.getAccounts.bind(eth))()

        const walletId = accounts[0];
        this.userRegistryContract.setProvider(currentProvider);

        let instance
        try {
            instance = await this.userRegistryContract.deployed()
        } catch (error) {
            console.log('user-registry-service could not find user:', walletId)
            throw error
        }

        const response = instance.get.call(walletId)
        console.log("user-registry-service found user:", response);
        return response
    }

}

const userRegistryService = new UserRegistryService()

export default userRegistryService


