// This is intended to be deployed as a Google Cloud Function to relay
// Google Build events to Discord

const octokit = require('@octokit/rest')();
const Discord = require('discord.js');

const hook = new Discord.WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN
);

// Subscribe is the main function called by Cloud Functions.
module.exports.subscribe = async (event, callback) => {
  const build = eventToBuild(event.data);

  const status = ['WORKING', 'SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
  if (status.indexOf(build.status) === -1) {
    return;
  }

  // Don't announce anything if _CONTAINER isn't present
  if (!build.substitutions._CONTAINER) {
    return
  }

  // Send message to Discord.
  const webhook = await createDiscordWebhook(build);
  if (webhook.message) {
    hook.send(webhook.message, webhook.options).then(callback);
  }
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = data => {
  return JSON.parse(new Buffer(data, 'base64').toString());
};

const getBuildCommitData = async build => {
  let owner = 'OriginProtocol',
    repo = 'origin',
    sha = build.sourceProvenance.resolvedRepoSource.commitSha;
  return await octokit.repos.getCommit({ owner, repo, sha });
};

// createDiscordMessage create a message from a build object.
const createDiscordWebhook = async build => {
  let commitData = await getBuildCommitData(build);

  let container = `${build.substitutions._CONTAINER}`;
  let buildId = `${build.id}`;
  let commitHash = `${build.sourceProvenance.resolvedRepoSource.commitSha}`;
  let shortCommitMessage = commitData.data.commit.message.split('\n')[0];
  let shortHash = commitHash.substr(0, 8);
  let namespace;
  let avatarUrl = null;
  if (commitData.data.author && commitData.data.author.avatar_url) {
    avatarUrl = commitData.data.author.avatar_url;
  }
  switch (build.source.repoSource.branchName) {
    case 'master':
      namespace = '`dev`';
      break;
    case 'staging':
      namespace = '`staging`';
      break;
    case 'stable':
      namespace = '`prod`';
      break;
  }

  let message;
  // Base options
  let options = {
    username: 'OriginCI',
    avatarURL: 'https://bit.ly/2PgBEnm',
    embeds: [
      {
        fields: [
          {
            name: 'Build ID',
            value: `[${buildId}](${build.logUrl})`
          }
        ]
      }
    ]
  };

  if (build.status === 'WORKING') {
    // Embed the GitHub commit data
    message = `Deployment triggered for \`${container}\` to \`${namespace}\``;
    options.embeds[0].color = '16759552';
    options.embeds.unshift({
      author: {
        name: commitData.data.commit.author.name,
        icon_url: avatarUrl
      },
      color: '16759552',
      description: `[${shortHash}](${
        commitData.data.commit.url
      }) - ${shortCommitMessage}`
    });
  } else if (build.status === 'SUCCESS') {
    message = `Deployment succeeded for \`${container}\` to \`${namespace}\``;
    options.embeds[0].color = '3524352';
  } else if (build.status === 'FAILURE' || build.status === 'INTERNAL_ERROR') {
    message = `Deployment failure for \`${container}\` to \`${namespace}\``;
    options.embeds[0].color = '16724787';
  } else if (build.status === 'TIMEOUT') {
    message = `Deployment timeout for \`${container}\` to \`${namespace}\``;
    options.embeds[0].color = '16724787';
  }
  return { message: message, options: options };
};
