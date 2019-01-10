![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)
![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Protocol Docs

These docs are a work in progress, but you can view them live at: [http://docs.originprotocol.com](http://docs.originprotocol.com)

Contributions are welcome!


## Editing the docs

Clone locally with:

    git clone https://github.com/OriginProtocol/origin.git && cd origin/origin-docs

Make sure you have Ruby >=2.3.1 installed. Ruby 2.50 works great. If you don't have a current ruby on OSX, you can install a newer ruby version with brew or rbenv.
    
Start serving locally with:

    bundle install
    bundle exec jekyll serve

Preview your edits in your browser at: http://127.0.0.1:4000

## Deploying changes

Our docs are currently hosted on Github pages. Deploying changes (if you have access to the gh-pages branch) is as easy as running: 

    ./deploy.sh 
