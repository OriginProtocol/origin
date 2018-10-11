# Migrations

These scripts define how contracts are deployed onto the blockchain.
Once a migration has been run, it cannot be undone. Truffle keeps track 
of which migrations have already been run (via `Migrations.sol`) and 
will only run _new_ migrations. You can force all new migrations with
the `--reset` modifier. ([link](https://truffleframework.com/docs/truffle/getting-started/running-migrations#command))
