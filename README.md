![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Origin Protocol Docs

These docs are very much a work in progress, but you can view them live at:

### [http://docs.originprotocol.com](http://docs.originprotocol.com)

Contributions welcome!


## Editing the docs

To get setup to edit the Origin docs:

    git clone https://github.com/OriginProtocol/docs.git origin-docs
    cd origin-docs
    bundle install
    bundle exec middleman server

You will then be able to preview your edits in your browser at http://127.0.0.1:4567
   
Detailed documentation on how to use the Slate documentation system can be found at:

[https://github.com/lord/slate](https://github.com/lord/slate)

## Deploying changes

Our docs are currently hosted on Github pages. Deploying changes (if you have access to this repo) is as easy as running `./deploy.sh`

[https://github.com/lord/slate/wiki/deploying-slate](https://github.com/lord/slate/wiki/deploying-slate)
