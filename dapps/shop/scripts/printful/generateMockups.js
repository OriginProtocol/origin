const get = require('lodash/get')

const downloadMockups = require('./downloadMockups')

async function generateMockups({
  OutputDir,
  id,
  PrintfulURL,
  productId,
  apiAuth,
  body
}) {
  const res = await fetch(
    `${PrintfulURL}/mockup-generator/create-task/${productId}`,
    {
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${apiAuth}`
      },
      method: 'POST',
      body: JSON.stringify(body)
    }
  )
  const json = await res.json()
  console.log(JSON.stringify(json, null, 2))
  const result = json.result
  console.log(
    `${PrintfulURL}/mockup-generator/task?task_key=${result.task_key}`
  )

  // await new Promise(resolve => setTimeout(resolve, 5000))
  let taskJson = {}

  while (get(taskJson, 'result.status') !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const taskRes = await fetch(
      `${PrintfulURL}/mockup-generator/task?task_key=${result.task_key}`,
      {
        headers: {
          'content-type': 'application/json',
          authorization: `Basic ${apiAuth}`
        },
        method: 'GET'
      }
    )
    taskJson = await taskRes.json()
    if (get(taskJson, 'result.status') !== 'completed') {
      console.log(JSON.stringify(taskJson, null, 2))
    }
  }
  if (get(taskJson, 'result.status') === 'completed') {
    await downloadMockups({ OutputDir, id, taskJson })
  }
  console.log(JSON.stringify(taskJson, null, 2))
}

module.exports = generateMockups
