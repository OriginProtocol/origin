// This is intended to be deployed as a Google Cloud Function to relay
// Google Build events to Discord

const octokit = require('@octokit/rest')()
const Discord = require('discord.js')

const hook = new Discord.WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN
);

// Subscribe is the main function called by Cloud Functions.
module.exports.subscribe = (event, callback) => {
 const build = eventToBuild(event.data.data);

  const status = ['WORKING', 'SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
  if (status.indexOf(build.status) === -1) {
    return callback();
  }

  // Send message to Discord.
  const webhook = createDiscordWebhook(build);
  hook.send(webhook.message, webhook.options).then(callback);
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
  return data;
  return JSON.parse(new Buffer(data, 'base64').toString());
}

const getBuildCommitData = async (build) => {
  let owner = 'OriginProtocol',
    repo = 'origin',
    commit_sha = build.sourceProvenance.resolvedRepoSource.commitSha;
  return await octokit.repos.getCommit({owner, repo, commit_sha});
};

// createDiscordMessage create a message from a build object.
const createDiscordWebhook = (build) => {
  let message;
  // Base options
  let options = {
    username: 'OriginCI',
    avatarURL: 'https://bit.ly/2PgBEnm',
  };

  let container = `\`${build.substitutions._CONTAINER}\``;
  let buildId = `\`${build.id}\``;
  let namespace
  switch(build.source.repoSource.branchName) {
    case 'master':
      namespace = '`dev`';
      break;
    case 'staging':
      namespace = '`staging`';
      break;
    case 'prod':
      namespace = '`prod`';
      break;
  };

  if (build.status === 'WORKING') {
    let commitData = getBuildCommitData(build);
    // Embed the GitHub commit data
    message = `Deployment triggered for ${container} to ${namespace}`;
    options.embeds = [{
      author: commitData.author.name,
      color: '16759552',
      description: commitData.message,
    }, {
      fields: [{
        name: 'Build ID',
        value: buildId
      }]
    }];
  } else if (build.status === 'SUCCESS') {
    message = `Deployment succeeded for ${container} to ${namespace}`;
    options.embeds = [{
      author: {
        name: 'Google Cloud Build',
        url: build.logUrl
      },
      fields: [{
        name: 'Build ID',
        value: buildId
      }],
      color: '3524352'
    }];
  } else if (build.status === 'FAILURE' || build.status === 'INTERNAL_ERROR') {
    message = `Deployment failure for ${container} to ${namespace}`;
    options.embeds = [{
      author: {
        name: 'Google Cloud Build',
        url: build.logUrl
      },
      fields: [{
        name: 'Build ID',
        value: buildId
      }],
      color: '16724787'
    }];
  } else if (build.status === 'TIMEOUT') {
    message = `Deployment timeout for ${container} to ${namespace}`;
    options.embeds = [{
      author: {
        name: 'Google Cloud Build',
        url: build.logUrl
      },
      fields: [{
        name: 'Build ID',
        value: buildId
      }],
      color: '16724787'
    }];
  }
  return { message: message, options: options };
}
