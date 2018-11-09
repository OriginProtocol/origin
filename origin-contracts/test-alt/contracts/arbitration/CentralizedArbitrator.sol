/**
 *  @title Arbitration Standard
 *  @author Clément Lesaege - <clement@lesaege.com>
 *  Bug Bounties: This code hasn't undertaken a bug bounty program yet.
 */

pragma solidity ^0.4.24;

import "./Arbitrator.sol";

/** @title Centralized Arbitrator
 *  This is a centralized arbitrator deciding alone of the result of disputes.
 *  No appeals are possible.
 */
contract CentralizedArbitrator is Arbitrator {

    address public owner = msg.sender;
    uint arbitrationPrice; // Not public because arbitrationCost already acts as an accessor.
    uint constant NOT_PAYABLE_VALUE = (2**256-2) / 2; // High value to be sure that the appeal is too expensive.

    struct Dispute {
        Arbitrable arbitrated;
        uint choices;
        uint fee;
        uint ruling;
        DisputeStatus status;
    }

    modifier onlyOwner {require(msg.sender==owner); _;}

    Dispute[] public disputes;

    /** @dev Constructor. Set the initial arbitration price.
     *  @param _arbitrationPrice Amount to be paid for arbitration.
     */
    constructor(uint _arbitrationPrice) public {
        arbitrationPrice = _arbitrationPrice;
    }

    /** @dev Set the arbitration price. Only callable by the owner.
     *  @param _arbitrationPrice Amount to be paid for arbitration.
     */
    function setArbitrationPrice(uint _arbitrationPrice) public onlyOwner {
        arbitrationPrice = _arbitrationPrice;
    }

    /** @dev Cost of arbitration. Accessor to arbitrationPrice.
     *  @param _extraData Not used by this contract.
     *  @return fee Amount to be paid.
     */
    function arbitrationCost(bytes _extraData) public constant returns(uint fee) {
        _extraData;
        return arbitrationPrice;
    }

    /** @dev Cost of appeal. Since it is not possible, it's a high value which can never be paid.
     *  @param _disputeID ID of the dispute to be appealed. Not used by this contract.
     *  @param _extraData Not used by this contract.
     *  @return fee Amount to be paid.
     */
    function appealCost(uint _disputeID, bytes _extraData) public constant returns(uint fee) {
        _disputeID;
        _extraData;
        return NOT_PAYABLE_VALUE;
    }

    /** @dev Create a dispute. Must be called by the arbitrable contract.
     *  Must be paid at least arbitrationCost().
     *  @param _choices Amount of choices the arbitrator can make in this dispute. When ruling ruling<=choices.
     *  @param _extraData Can be used to give additional info on the dispute to be created.
     *  @return disputeID ID of the dispute created.
     */
    function createDispute(uint _choices, bytes _extraData) public payable requireArbitrationFee(_extraData) returns(uint disputeID)  {
        super.createDispute(_choices, _extraData);
        disputeID = disputes.push(Dispute({
            arbitrated: Arbitrable(msg.sender),
            choices: _choices,
            fee: msg.value,
            ruling: 0,
            status: DisputeStatus.Waiting
        })) - 1; // Create the dispute and return its number.
      	emit DisputeCreation(disputeID, Arbitrable(msg.sender));
    		return disputeID;
    }

    /** @dev Give a ruling. UNTRUSTED.
     *  @param _disputeID ID of the dispute to rule.
     *  @param _ruling Ruling given by the arbitrator. Note that 0 means "Not able/wanting to make a decision".
     */
    function giveRuling(uint _disputeID, uint _ruling) public onlyOwner {
        Dispute storage dispute = disputes[_disputeID];
        require(_ruling <= dispute.choices);

        uint fee = dispute.fee;
        Arbitrable arbitrated = dispute.arbitrated;
        dispute.arbitrated = Arbitrable(0x0); // Clean up to get gas back and prevent calling it again.
        dispute.fee = 0;
        dispute.ruling = _ruling;
        dispute.status = DisputeStatus.Solved;

        msg.sender.transfer(fee);
        arbitrated.rule(_disputeID,_ruling);
    }

    /** @dev Return the status of a dispute.
     *  @param _disputeID ID of the dispute to rule.
     *  @return status The status of the dispute.
     */
    function disputeStatus(uint _disputeID) public constant returns(DisputeStatus status) {
        return disputes[_disputeID].status;
    }

    /** @dev Return the ruling of a dispute.
     *  @param _disputeID ID of the dispute to rule.
     *  @return ruling The ruling which would or has been given.
     */
    function currentRuling(uint _disputeID) public constant returns(uint ruling) {
        return disputes[_disputeID].ruling;
    }
}
