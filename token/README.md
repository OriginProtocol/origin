This directory contains code for interacting with Origin tokens on TestNets.
  - faucet: Web application that implements a faucet for Origin tokens.
  - scripts: Scripts and cli tools.
  - lib: Common code.
 
 Prerequisite
 ============
  Use origin-box to start an origin-js container.
  
      docker-compose up origin-js
      
 To use the faucet
 =================
 Start the server in the origin-js container
 
     docker exec -w /app/token origin-js node faucet/app.js --network_ids=999
 
  The server should start and you can point your browser to http://localhost:5000 to access the faucet web UI.
  
  To use the cli
  ==============  
  Example 1 - get the balance of an account:
  
      docker exec -w /app/token origin-js node scripts/token_cli.js --network_id=999 --wallet=0xf17f52151ebef6c7334fad080c5704d77216b732 --action=balance
  
  Example 2 - credit the account with extra tokens:
  
      docker exec -w /app/token origin-js node scripts/token_cli.js --network_id=999 --wallet=0xf17f52151ebef6c7334fad080c5704d77216b732 --action=credit
 