# Google Cloud Setup

## Installing Google Cloud SDK

Instructions are available [here.](https://cloud.google.com/sdk/docs/quickstarts)

## Installing kubectl

The kubectl tool is the main utility used to interact with the Kubernetes cluster. You can install it with:

`gcloud components install kubectl`
  
You will then need to grab the credentials for the Origin Kubernetes cluster, you can do this by running:

`gcloud container clusters get-credentials origin`
  
Running this will configure `kubectl` so that every subsequent command runs against the Origin cluster.
  
## Installing Helm

Helm is a tool used to manage a deployment that consists of many Kubernetes resources rather than interacting with each resource one by one. It consists of a client side tool called `helm` and a server side tool called `tiller`. The cluster already has `tiller` configured and installed.

The instructions for installing Helm are available [here](https://github.com/helm/helm/blob/master/docs/install.md). You can ignore everything from the "Installing Tiller" heading down.

## Installing SOPS

[SOPS](https://github.com/mozilla/sops) is used for encrypting and decrypting deployment secrets. Install it and follow the instructions for GCP KMS for authentication.

The key for encryption of secrets is available at:

`projects/origin-214503/locations/global/keyRings/sops/cryptoKeys/sops-key`

To encrypt a secrets file run

`sops --encrypt --gcp-kms projects/origin-214503/locations/global/keyRings/sops/cryptoKeys/sops-key secret.yaml > secret.enc.yaml`

## Allowing Docker to use Google Container Registry

You will need to provide Docker with credentials for GCR to allow it to push containers:

`gcloud auth configure-docker`

# Deploying

The general steps for updating a service are:

1. Build a new container for the service with the code you want to deploy
2. Push the container to Google Container Registry
3. Update the tag of the container in the Origin Helm chart
4. Sync the Helm release

This process is automated by `deploy.sh` found at the top level of `origin-box`. It can be used to update Helm releases and deploy new containers. It uses the Helm chart found in `deployment/kubernetes/chart` and the values files found in `deployment/kubernetes/values`. The containers it builds are found in `deployment/dockerfiles`.

You can run `deploy.sh` without a `-c` argument  to update the Helm release for a namespace:

`./deploy.sh -n dev`

Or you can use it to build a new container:

`./deploy.sh -c origin-dapp -n dev`

The container that gets built will use the code from the current state of your `origin-box` repository. If `origin-box/origin-dapp` is not up to date or on the wrong commit you'll get a bad container. **This is just temporary, the dockerfiles will be changed to clone the relevant branch shortly.**

When you deploy a new container the values file for the deployment will get updated with the tag of the new image in use. Please remember to commit that file after a deployment.
