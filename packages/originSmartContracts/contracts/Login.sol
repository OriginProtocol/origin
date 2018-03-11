pragma solidity ^0.4.11;

contract Login {

    event LoginAttempt(address sender, string challenge);

    function login(string challenge) public returns (string){
        LoginAttempt(msg.sender, challenge);
        return challenge;
    }

}