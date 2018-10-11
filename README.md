![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)
![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Protocol Docs

These docs are a work in progress, but you can view them live at: [http://docs.originprotocol.com](http://docs.originprotocol.com)

Contributions are welcome!


## Editing the docs

Clone locally with:

    git clone https://github.com/OriginProtocol/docs.git origin-docs && cd origin-docs

Make sure you have Ruby >=2.3.1 installed or install with Homebrew/rvm:

    brew install ruby
    
Start serving locally with: 

    bundle install
    bundle exec middleman server

Preview your edits in your browser at: http://127.0.0.1:4567

The Markdown files that our docoumentation is built from are located in [`source/includes`](source/includes).
   
Detailed documentation on how to use the Slate documentation system can be found at: [https://github.com/lord/slate](https://github.com/lord/slate)

## Deploying changes

Our docs are currently hosted on Github pages. Deploying changes (if you have access to this repo) is as easy as running: [More information](https://github.com/lord/slate/wiki/deploying-slate)

    ./deploy.sh

### One Time Deploy Setup

You'll need to rename your git remote to `gitub`:

    git remote rename origin github

If a deploy fails (e.g. if your git remote name is wrong), you'll have a ton of generated files that git will complain about. You can clear them with:

    git clean -f && git clean -fd
    
