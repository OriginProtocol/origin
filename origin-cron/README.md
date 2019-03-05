# origin-cron

A framework for scheduling recurring jobs, based on the [Bull](https://github.com/OptimalBits/bull) queueing system and Redis.
Each job runs as a separate process

## Adding a new job
Steps:
  * Implement the job logic in a new file under src/jobs/
  * Schedule the job by adding a queue and defining the job scheduler in src/scheduler.js

## Important notes
  * Jobs should be idempotent since the framework only provides at least once guarantees. For more details, read Bull's [documentation](https://github.com/OptimalBits/bull#important-notes).
