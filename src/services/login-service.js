import LoginContract from '../../build/contracts/Login.json'

class LoginService {
    static instance

    constructor() {
        if (LoginService.instance) {
            return LoginService.instance
        }

        LoginService.instance = this;

        this.contract = require('truffle-contract')
        this.loginContract = this.contract(LoginContract)

        console.log(this.loginContact);
    }


    login(jwt) {
        return new Promise((resolve, reject) => {
            this.loginContract.setProvider(window.web3.currentProvider);
            this.loginContract.deployed()
            .then((instance) => {
                return instance.login.call(jwt)
            })
            .then((response)  => {
                console.log("login-service sees:", response);
                resolve(response)
            })
            .catch((error) => {
                console.log('Error logging in:')
                reject(error)
            })
        })
    }


    // this.loginContract.on('LoginAttempt', function(){
    //
    // });


}

const loginService = new LoginService()

export default loginService


