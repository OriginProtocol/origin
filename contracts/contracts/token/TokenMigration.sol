pragma solidity ^0.4.23;

import "../../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./OriginToken.sol";

contract TokenMigration is Ownable {
  OriginToken public fromToken;
  OriginToken public toToken;
  mapping (address => bool) migrated;
  bool public finished;

  event Migrated(address indexed account, uint256 balance);
  event MigrationFinished();
  
  modifier notFinished() {
    require(!finished, "migration already finished");
    _;
  }

  constructor(OriginToken _fromToken, OriginToken _toToken) public {
    owner = msg.sender;
    fromToken = _fromToken;
    toToken = _toToken;
  }

  function migrateAccounts(address[] _holders) public onlyOwner notFinished {
    for (uint i = 0; i < _holders.length; i++) {
        migrateAccount(_holders[i]);
    }
  }
  
  function migrateAccount(address _holder) public onlyOwner notFinished {
    require(!migrated[_holder], "holder already migrated");
    uint256 balance = fromToken.balanceOf(_holder);
    if (balance > 0) {
      toToken.mint(_holder, balance);
      migrated[_holder] = true;
      emit Migrated(_holder, balance);
    }
  }
  
  // @dev finishes migration and transfers token ownership to new owner
  function finish(address _newTokenOwner) public onlyOwner notFinished {
    require(fromToken.totalSupply() == toToken.totalSupply(),
      "total token supplies do not match");
    require(_newTokenOwner != address(this),
      "this contract cannot own the token contract");
    finished = true;
    toToken.transferOwnership(_newTokenOwner);
    emit MigrationFinished();
  }
  
  // TODO: revisit whether we want to migrate approvals
}

// DELETE ME BEFORE MERGE -->
//
// NOTE: you'll need a gas limit of ~7,000,000 to deploy this contract in Remix
contract NewOriginToken is OriginToken {
  constructor(uint256 _initialSupply) public OriginToken(_initialSupply) { }
    
  function answerToLife() public pure returns (uint256) {
    return 42;
  }
}

contract TestTokenMigrationDeleteMeBeforeMerge {
  OriginToken public token;
  address constant other = address(1);
  uint256 constant initialSupply = 100;
  uint256 constant transferAmount = 2;
  
  constructor() public {
    token = new OriginToken(100);
    require(token.transfer(other, transferAmount));
  }
  
  function migrate() public {
    OriginToken oldToken = token;
    token = new NewOriginToken(0);
    
    // pause both contracts
    oldToken.pause();
    token.pause();
    
    // transfer token ownership to migration contract, because migrations need
    // to mint new tokens
    TokenMigration migration = new TokenMigration(oldToken, token);
    token.transferOwnership(migration);

    // migrate balances (NOT APPROVALS, which we may need to revisit)
    address[] memory holders = new address[](2);
    holders[0] = address(this);
    holders[1] = other;
    migration.migrateAccounts(holders);

    // finish migration, which transfers the ownership of the token contract
    // back to this test contract
    migration.finish(address(this));
    token.unpause();
    
    // verify
    require(token.totalSupply() == initialSupply, "total supply wrong");
    require(token.balanceOf(address(this)) == initialSupply - transferAmount,
      "owner balance wrong");
    require(token.balanceOf(other) == transferAmount, "other balance wrong");
  }
}
// <-- DELETE ME BEFORE MERGE