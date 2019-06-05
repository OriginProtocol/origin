#!/bin/env node
/**
 * Pipe JSON logs through this for better formatting
 *
 * Example Usage:
 * cat logs.json | devops/scripts/formatJSONLogs.js
 *
 * Example log JSON objet from stackdriver:
 *
 *   {
 *    "textPayload": "\u001b[36;22m[DEBUG] \u001b[39;1mevent-listener\u001b[0m: Got 0 new events for Marketplace\n",
 *    "insertId": "dvi745fbtzr00",
 *    "resource": {
 *      "type": "container",
 *      "labels": {
 *        "container_name": "event-listener",
 *        "namespace_id": "prod",
 *        "instance_id": "8437535530885062773",
 *        "zone": "us-west1-a",
 *        "pod_id": "prod-eventlistener-58575694cc-f8m4c",
 *        "project_id": "origin-214503",
 *        "cluster_name": "origin"
 *      }
 *    },
 *    "timestamp": "2019-05-24T03:42:50.138913830Z",
 *    "severity": "INFO",
 *    "labels": {
 *      "container.googleapis.com/namespace_name": "prod",
 *      "compute.googleapis.com/resource_name": "gke-origin-n1-standard-8-60b55718-4xmk",
 *      "container.googleapis.com/pod_name": "prod-eventlistener-58575694cc-f8m4c",
 *      "container.googleapis.com/stream": "stdout"
 *    },
 *    "logName": "projects/origin-214503/logs/event-listener",
 *    "receiveTimestamp": "2019-05-24T03:42:55.897550883Z"
 *  }
 */
const getStdin = require('get-stdin')

function formatLogEntry(entry) {
  return `[${entry.severity}] - ${entry.timestamp} - ${entry.textPayload}`
}

async function processStdin() {
  const jasonStr = await getStdin()
  if (!jasonStr) {
    throw new Error('No stdin')
  }
  const logs = JSON.parse(jasonStr)
  for (const entry of logs) {
    process.stdout.write(formatLogEntry(entry))
  }
}

// if called directly and has stdin
if (require.main === module && !process.stdin.isTTY) {
  processStdin()
}
