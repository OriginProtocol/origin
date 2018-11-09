# Working with Origin Deployments

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
