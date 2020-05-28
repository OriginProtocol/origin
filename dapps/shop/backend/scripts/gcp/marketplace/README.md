# Dshop compute image builder

<img width="346" alt="dshops" src="https://user-images.githubusercontent.com/837/80967164-ea868b00-8de3-11ea-85e8-cc863afbdc09.png">

## Quickstart

You will need [packer](https://www.packer.io/downloads/) installed, and
[`gcloud`](https://cloud.google.com/sdk/gcloud/) installed and configured.

    ./build.sh

## Building Google VM Images 

In theory, building a VM image for Google compute instances is as simple as:

- Starting an instance
- SSHing in and setting things up the way you want it
- Stopping the instance
- Making a snapshot image of that boot drive

Except, that simple way leaves junk on the drive, so there's a painful multi step cleanup dance afterwords. To make this better, "Packer" can be used to automate the entire process. You specify what kind of instance should be started, and a script to be run after that template instance is started. Packer can also be used to create VM images for AWS, Azure, Digital Ocean, etc. https://www.packer.io/docs/builders/googlecompute.html

## Doing a VM Build

To build the VM you will need Packer (https://www.packer.io) which installs easily over brew, and gcloud, which you probably already have.

Packer takes a packer.json config file that controls how it works. In the sample packer file, you will need to update the Google project id and the image name before building.

You will also need an account to build this from. While it's possible there's a way to have packer just use your gcloud credentials, I've never got that working. Instead, I use an accounts.json file, tied to a build identity/user on GCP . This new user needs three permisions set:

- Compute Instance Admin (v1)
- Service Account User
- Storage Admin

The documenation says that only the first two permissions are needed, but I wasn't able to get it to work without it. After you create the user, you need to download a json formatted key file, and call it accounts.json.

To build, just run:
    
    packer build packer.json

Which takes me about 8 eight minutes.

Packer itself is running all commands remotely, either against the GCP API or on the server over SSH. It isn't building a VM on your computer.

## The Build Script

Everything you want do to make your image needs to kick off from a single bash build script. You get no feedback on your local console while this script is running, and the VM image build continues regardless of if your script works or explodes.

For development purposes, it's way easier to spin up your own VM and test your script on it. Only once everything is nailed down, then worry about doing a new build through packer. I've made the current build script basicly write itself to file, then run it, teeing the script output to a file. This lets you run the same script against a test VM when you are working quickly, and from packer. When you run a new packer VM, you can look at /root/setup_log.log to what happend during the build process.

## Why a VM Image

I tested three different approaches: Kubernetes cluster, docker image hosted via Compute Engine instance with Google's Container OS, and a tradtional VM image for Compute Engine.

The Kubernetes cluser was, well, Kubernetes. I don't think 99.9% of our customers would need this, and it would massivly increase the cost (by requiring multiple instances) and the complexity.

Building a docker container running that container in Container OS on a compute instance was surprisingly easy. The only real work was configuring your local docker setup to send to Google's container repository.  Unfortinutly, containers don't get nearly as nice google marketplace pages, and it's an extra layer of virtualization. Otherwise, it worked beautifly and simply, and is a trick I'll keep in my bag for the future.

Buulding the VM side was a bit of a pain to get going. I don't think I ran accross a single tutorial that worked end to end. Packer gives straight up misleading error messages that can have nothing at all to do with the actual problem. As already mentioned, getting packer setup has been quite a pain, but now that it's working, it seems to work well and the process and config is easy to understand. Most importantly the user experince for creating a VM is very good, and it keeps the cost low and clear to the user. 

## From here:

The current build is not optimized for production - it's basicly a proof of concept. SSL is not enabled, and it's an open question how we handle that.

Once we have a production ready VM, we will need to follow the steps here: https://cloud.google.com/marketplace/docs/partners/vm/build-vm-image