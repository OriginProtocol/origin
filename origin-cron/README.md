# origin-cron

A framework for scheduling recurring jobs, based on the [Bull](https://github.com/OptimalBits/bull) queueing system and Redis.
Each job runs as a separate process.

## Adding a new job
Steps:
  * Implement the job logic in a new file under src/jobs.
  * Schedule the job by adding a queue and defining the job scheduler under src/scheduler.js

## Important notes
  * Jobs should be idempotent since the framework only provides at least once guarantees. For more details, read Bull's [documentation](https://github.com/OptimalBits/bull#important-notes).

## Running in local environment
  * Install Redis locally
  * Start the scheduler:
```
lerna bootstrap --scope origin-cron
lerna run start --scope origin-cron --stream
```

## TODO
  * Currently all jobs run on the same node. Consider adding clustering.
  * Bring up a UI for making it easier to inspect the state of the system. [Arena](https://github.com/bee-queue/arena#readme) could be a good choice. We would have to figure how to make that data only accessible to Origin team members. kubectl port-forward could be a simple solution for this. 