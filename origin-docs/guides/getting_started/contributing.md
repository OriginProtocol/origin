---
layout: page
title: Contributing
toc: true
category: "Getting started"
---

Want to hack on Origin? Awesome!

Origin is an Open Source project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

We use a monorepo for almost all of our development -- see [Origin](https://github.com/OriginProtocol/origin/) on GitHub.

You are most likely interested in these projects inside the monorepo:

- [Origin.js](https://github.com/OriginProtocol/origin/tree/master/origin-js#origin-js) - Solidity contracts and JavaScript API
- [Origin DApp](https://github.com/OriginProtocol/origin/tree/master/origin-dapp#origin-dapp) - example React-powered decentralized application
- [Origin Bridge Server](https://github.com/OriginProtocol/origin/tree/master/origin-bridge#origin-bridge-server) - Python and JavaScript for indexing, attestations, and messaging
- [Origin Box](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md#using-docker-compose) - Docker container for simplifying local development

Other repos of interest:

- [Origin Website](https://github.com/OriginProtocol/origin-website) - Python/Flask for originprotocol.com
- [Playground](https://github.com/OriginProtocol/origin-playground#origin-identity-playground) - implementation of ERC 725/735 for blockchain identity

## Discord

We work in public and our company Discord is open to all. If you have questions or need help getting started, our [Discord #engineering channel](https://www.originprotocol.com/discord) is the absoulute best place to get assistance from our team of engineers and developers.

## Weekly Engineering Call

We have an open weekly engineering call on Google Hangouts every Wednesday at 12:30 Pacific Time. [Add to Calendar](https://calendar.google.com/event?action=TEMPLATE&tmeid=YXBiOThhc2s3cnE4NGltMXFwbWhpY3ZpNm9fMjAxOTAxMDlUMjAzMDAwWiBtaWNhaEBvcmlnaW5wcm90b2NvbC5jb20&tmsrc=micah%40originprotocol.com&scp=ALL)

![Origin Engineering Call](/source/images/origin_engineering_call.png "Origin Engineering Call")

Join the call here: [https://meet.google.com/pws-cgyd-tqp](https://meet.google.com/pws-cgyd-tqp)

Everyone is welcome to join, even if you're just lurking. All we ask is that you mute when not speaking to minimize background noise. All our meeting notes are public and can be reviewed here:

- [Engineering Notes](https://docs.google.com/document/d/1aRcAk_rEjRgd1BppzxZJK9RXfDkbuwKKH8nPQk7FfaU)
- [Product/Design Notes](https://docs.google.com/document/d/1tVx2O3qeplh9vawJpURTsJxZfUe1B0FrTHOMJbxKm-s)

## Dive Right In

If you're ready to start hacking on Origin right now and you just need an issue to focus on, check out our [open issues](https://github.com/search?utf8=%E2%9C%93&q=user%3AOriginProtocol+is%3Aopen+&type=Issues) especially those tagged as a [good first issue](
https://github.com/search?utf8=%E2%9C%93&q=user%3AOriginProtocol+is%3Aopen++label%3A%22good+first+issue%22&type=Issues&ref=advsearch&l=&l=).

We use two week development sprints and you can see what we're currently prioritizing on [our Github project board](https://github.com/orgs/OriginProtocol/projects/2).

Read our [development process](#contributing-email-development-process) and [community guidelines](#contributing-email-community-guidelines) first and have fun!

## Development Process

Getting your local environment running is easy with [Origin Box](https://github.com/OriginProtocol/origin/tree/master/development#origin-box). We recommend using this Docker container for any development or testing that involves running a local blockchain.

Our branching strategy is similar to [GitFlow](http://nvie.com/posts/a-successful-git-branching-model/), but we do all of our development in the `master` branch and have a `stable` branch for code that has been released.

Your development flow should look like:

1. Find an interesting issue and communicate! Please let the `#engineering` [Discord](https://discord.gg/jyxpUSe) channel know what you want to work on.
1. Ping a [core team member](https://github.com/orgs/OriginProtocol/teams/core/members) member on Discord and ask to be added to our [contributors team](https://github.com/orgs/OriginProtocol/teams/contributors). Otherwise, you'll need to fork the relevant repository and push feature branches to your own fork.
1. Add a comment to the issue or self-assign so we don't have multiple contributors unintentionally working on the same task.
1. Start with the `master` branch and check out a new feature branch unless you're contributing to an existing feature.
1. Follow the appropriate [coding style](#contributing-email-coding-style) and write some awesome code.
1. Pull the latest commits from `master` and confirm that your code works with any other work that has been merged since you started.
1. Push your branch to the upstream repository (i.e. https://github.com/OriginProtocol/[repo]) so that other contributors can easily work off of it if necessary.
1. Please request a review in the PR by clicking on the gear icon next to "Reviewers" in the right column.

The `master` branche is locked so that only members of the [core team](https://github.com/orgs/OriginProtocol/teams/core) are able to merge your pull requests. Pull requests that are peer reviewed by other trusted contributors will be fast-tracked and merged faster! Check in the `#engineering` Discord channel for appropriate reviewers.

## Coding Style

We use a variety of programming languages in our repositories. When contributing, please follow existing coding conventions and refer to the CONTRIBUTING.md file in the repository, if one exists. 

For JavaScript, we use [NPM's style](https://docs.npmjs.com/misc/coding-style), which is automatically enforced via [prettier](https://prettier.io/).

For Solidity, we use two space indents.

## Troubleshooting a Development Environment

* If you encounter errors while executing `npm install` for any of the Origin repositories, try running a recent LTS version of Node.js. [nvm](https://github.com/creationix/nvm) is a tool that can install specific versions of Node.js. After installing `nvm`, run `nvm install --lts`, remove your `node_modules` directory, and run `npm install` again.

* If you are using `origin-box` Docker setup and are running OSX Sierra below 10.13.4 Docker volumes might randomly stop syncing. This results in problems where host machine source code updates do not get propagated to file system inside Docker. To resolve this issue update OSX Sierra to 10.13.4 or above. See [this thread](https://github.com/EugenMayer/docker-sync/issues/517) for more details. 

## Protocol Design

When considering protocol or implementation design proposals, we are looking for:

- A description of the problem this design proposal solves
- Discussion of the trade-offs involved
- Review of other existing solutions
- Links to relevant literature (RFCs, papers, etc)
- Discussion of the proposed solution

Please note that protocol design is hard and meticulous work. You may need to review existing literature and think through generalized use cases.

## Community Guidelines

We want to keep the Origin community awesome, growing and collaborative. We need your help to keep it that way. To help with this we've come up with some general guidelines for the community as a whole:

- Be nice: Be courteous, respectful and polite to fellow community members: no regional, racial, gender, or other abuse will be tolerated. We like nice people way better than mean ones!

- Encourage diversity and participation: Make everyone in our community feel welcome, regardless of their background and the extent of their contributions, and do everything possible to encourage participation in our community.

- Keep it legal: Basically, don't get anybody in trouble. Share only content that you own, do not share private or sensitive information, and don't break laws.

- Stay on topic: Make sure that you are posting to the correct channel and avoid off-topic discussions. Remember when you update an issue or respond to an email you are potentially sending to a large number of people. Please consider this before you update. Also remember that nobody likes spam.

## Reporting Issues

If you find bugs, mistakes or inconsistencies in the Origin project's code or
documents, please let us know by filing an issue at the appropriate issue
tracker (we use multiple repositories). 

<aside class="notice">
No issue is too small. Help us fix our tpyos!
</aside>

- [Good first issues](https://github.com/OriginProtocol/origin/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22+)
- [Docs issues](https://github.com/OriginProtocol/origin/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Adocs)
- [Origin.js issues (JS API & Solidity contracts)](https://github.com/OriginProtocol/origin/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Aorigin.js)
- [DApp issues](https://github.com/OriginProtocol/origin/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Adapp)
- [Playground issues](https://github.com/OriginProtocol/origin-playground/issues)
- [Company website issues](https://github.com/OriginProtocol/origin-website/issues)

## Security Issues

The Origin Protocol and its implementations are still in early development, which means there may be problems with the protocol or in our implementations. We take security vulnerabilities very seriously. If you discover a security issue, please bring it to our attention right away!

If you find a vulnerability please send your report privately to [security@originprotocol.com](mailto:security@originprotocol.com) or [contact Josh Fraser via Keybase](https://keybase.io/joshfraser). Please DO NOT file a public issue.

If the issue is a protocol weakness or something not yet deployed, feel free to discuss it openly.

## Community Improvement

Origin is just as much about community as it is about our technology.

We need constant help in improving our documentation, building new tools to interface with our platform, spreading the word to new users, helping new users getting setup and much more.

Please get in touch if you would like to help out. Our `general` channel on [Discord](https://discord.gg/jyxpUSe) is a great place to share ideas and volunteer to help.

## Full Time Positions

Origin occasionally hires developers for part time or full time positions. 

We have a strong preference for hiring people who have already started contributing to the project. If you want a full time position on our team, your best shot is to engage with our team and start contributing code. It is very unlikely that we would offer you a full time position on our engineering team unless you've had at least a few pull requests merged.

If you are interested, check out [the Origin Protocol job listings](https://angel.co/originprotocol/jobs). If you'd like to help in other ways, please propose your ideas in the [Origin Discord](https://discord.gg/jyxpUSe).
