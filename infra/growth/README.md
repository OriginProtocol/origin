Origin Rewards

#Package structure:
 - campaigns: Campaigns configuration
 - data: Static data files
 - migrations: DB schema migration files
 - src
   - apollo: graphQL server for requests related to Rewards issued by DApp
   - config: Sequelize config
   - fraud: Fraud detection code
   - resources: Business logic
   - scripts: Payment pipeline
   - templates: Email templates
   - util: Misc utilities
 - test: unit tests
 
 #Local development
 Reminder: Do not forget to set the AUTH_PUB_KEY env var based on the value in EnvKey for the dev environment in production. Without that, the authentication will fail...

 